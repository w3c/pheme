
var cradle = require("cradle");

// store conf, type=couch
// keys: db, host, port, username, password
function CouchStore (conf, pheme, cb) {
    this.conf = conf;
    var dbName = this.dbName = this.conf.db || "pheme";
    this.pheme = pheme;
    this.client = new cradle.Connection(conf);
    this.db = this.client.database(dbName);
    pheme.info("connected to CouchDB");

    // install filters
    var installFilters = function () {
        // XXX install filters here
        cb();
    };

    // create DB if it doesn't exist
    this.db.exists(function (err, exists) {
        if (err) return this.pheme.error(err);
        if (exists) return installFilters();
        this.db.create(function (err) {
            if (err) return this.pheme.error(err);
            installFilters();
        });
    });
}
CouchStore.prototype = {
    add:    function (data, cb) {
        this.pheme.info("Inserting " + data.type + " from " + data.origin + " id=" + data.id);
        this.db.save(data.id, data, cb);
    }
,   addUnlessExists:    function (data, cb) {
        this.db.head(data.id, function (err, headers, status) {
            if (err) return cb(err);
            if (status == 200) return cb();
            this.add(data, cb);
        });
    }
,   get:    function (id, cb) {
        this.db.get(id, cb);
    }
};



module.exports = CouchStore;
