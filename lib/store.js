/* global emit */

var cradle = require("cradle")
,   isArray = require("util").isArray
,   async = require("async")
,   eventFilter = require("./filters/events")
,   log = require("./log")
;

// store conf, type=couch
// keys: db, host, port, username, password
function CouchStore (conf, pheme) {
    this.conf = conf;
    var dbName = this.dbName = this.conf.db || "pheme";
    this.pheme = pheme;
    this.client = new cradle.Connection(conf);
    this.db = this.client.database(dbName);
    log.info("connected to CouchDB");
}
CouchStore.prototype = {
    setup:  function (cb) {
        var store = this;
        // create DB if it doesn't exist
        this.db.exists(function (err, exists) {
            if (err) return log.error(err);
            if (exists) return store.setupDDocs(cb);
            store.db.create(function (err) {
                if (err) return log.error(err);
                store.setupDDocs(cb);
            }.bind(this));
        }.bind(this));
    }
,   setupDDocs: function (cb) {
        // escape data for use in Couch conditions
        var esc = function (str) {
            return str.replace(/\\/g, "\\\\")
                      .replace(/'/g, "\\'")
                      .replace(/\n/g, "\\n")
            ;
        }
        // generate reject conditions to know when not to index something
        ,   rejectCondition = function (key, conds) {
            var str = "    if (!doc." + key + " || (";
            conds = isArray(conds) ? conds : [conds];

            str += conds
                    .map(function (it) {
                        return "doc." + key + " !== '" + esc(it) + "'";
                    })
                    .join(" && ")
            ;
            return str + ")) return;";
        }
        // the design document for events
        ,   eventsDD = {
                id:         "_design/events"
            ,   language:   "javascript"
            ,   views:  {}
        };
        // we want:
        //  - ignore ACL for now, the filtering is provided by pheme based on what it knows
        //  - the view name is the filterName
        //  - the key is the date [year, month, day, hour, minute, second, ms]
        //  - drop events that don't have a date, it's broken data
        //  - every filterName should be able to match only for some specific things
        //      - drop anything that isn't of type=event
        //      - origin (github, W3CMemes)
        //      - repository (it's okay if it's null), matching an array for several
        for (var view in eventFilter) {
            var mapFunc = [
                        "function (doc) {"
                    ,   "    if (!doc.type || doc.type !== 'event') return;"
                    ,   "    if (!doc.time) return;"
                    ,   "    if (!doc.payload) return;"
                    ,   "    var d = new Date(doc.time)"
                    ,   "    ,   key = [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), " +
                                       "d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), " +
                                       "d.getUTCMilliseconds()]"
                    ,   "    ,   payload = doc.payload"
                    ,   "    ;"
            ];
            if (eventFilter[view].origin)
                mapFunc.push("    if (!doc.origin || doc.origin !== '" + eventFilter[view].origin + "') return;");
            if (eventFilter[view].repository)
                mapFunc.push(rejectCondition("payload.repository", eventFilter[view].repository));
            
            mapFunc.push("    emit(key, doc);");
            mapFunc.push("}");
            eventsDD.views[view] = {
                map:    mapFunc.join("\n")
            };
        }
        // list all events that require the updating of repos, since a given time
        eventsDD.views.updates = {
            map:    function (doc) {
                if (!doc.type || doc.type !== "event") return;
                if (!doc.origin || doc.origin !== "github") return;
                if (!doc.time) return;
                if (!doc.payload) return;
                var d = new Date(doc.time)
                ,   key = [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(),
                            d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(),
                            d.getUTCMilliseconds()]
                ,   payload = doc.payload
                ,   acceptTypes = {
                        create:         true
                    ,   delete:         true
                    ,   public:         true
                    ,   pull_request:   true
                    ,   push:           true
                    }
                ;
                if (!doc.event || !acceptTypes[doc.event]) return;
                emit(key, { event: doc.event, repo: payload.repository });
            }.toString()
        };
        
        // the design document for users
        var usersDD = {
            id:         "_design/users"
        ,   language:   "javascript"
        ,   views:  {
                by_username: {
                    map:    [
                                "function (doc) {"
                            ,   "    if (!doc.type || doc.type !== 'user') return;"
                            ,   "    emit(doc.username, doc);"
                            ,   "}"
                            ].join("\n")
                }
            }
        };
        
        async.parallel(
            [
                function (cb) { this.update(eventsDD, cb); }.bind(this)
            ,   function (cb) { this.update(usersDD, cb); }.bind(this)
            ]
        ,   cb
        );
    }
,   add:    function (data, cb) {
        log.info("Inserting id=" + data.id);
        if (data._rev) this.db.save(data.id, data._rev, data, cb);
        else this.db.save(data.id, data, cb);
    }
,   addUnlessExists:    function (data, cb) {
        this.db.head(data.id, function (err, headers, status) {
            if (err) return cb(err);
            if (status == 200) return cb();
            this.add(data, cb);
        }.bind(this));
    }
,   get:    function (id, cb) {
        this.db.get(id, cb);
    }
    // takes the _rev into account so as to update
,   update: function (data, cb) {
        this.db.get(data.id, function (err, res) {
            // if we have a 404, just add
            // if we have a real error, cb(err)
            if (err) {
                if (err.error === "not_found") return this.add(data, cb);
                return cb(err);
            }
            // use the _rev automatically in add()
            data._rev = res._rev;
            this.add(data, cb);
        }.bind(this));
    }
    // name is the name of the filter
,   listEvents:   function (name, options, cb) {
        if (!options) options = {};
        var query = {
            descending: true
        ,   limit:      30
        };
        if (options.limit) query.limit = options.limit;
        if (options.since) query.endkey = options.since;
        // XXX we start with descending=true and limit=20
        // when we add paging later, it will be very important to use endkey and not startkey as the
        // starting point. Or better, don't anchor with a key but rather use skip = page * page_size
        this.db.view("events/" + name, query, function (err, docs) {
            if (err) return cb(err);
            cb(null, docs.toArray());
        });
    }
    // the updates
,   listUpdates:    function (key, cb) {
        this.db.view("events/updates", { startkey: key }, function (err, docs) {
            if (err) return cb(err);
            cb(null, docs.toArray());
        });
    }
    // get a user by username
,   getUser:   function (uid, cb) {
        log.info("Looking for user " + uid);
        this.db.view("users/by_username", { key: uid }, function (err, docs) {
            log.info("Got user " + err + ", " + docs);
            if (err) return cb(err);
            cb(null, docs.length ? docs[0].value : null);
        }.bind(this));
    }
};

module.exports = CouchStore;

if (require.main === module) {
    var conf = require("../config.json").store || {}
    ,   store = new CouchStore(conf);
    store.setup(function (err) {
        if (err) return console.error(err);
        console.log("Ok!");
    });
}
