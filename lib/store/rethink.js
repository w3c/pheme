
var r = require("rethinkdb")
,   async = require("async")
;

function RethinkStore (conf, pheme, cb) {
    this.conf = conf;
    var db = this.db = this.conf.db || "pheme";
    this.pheme = pheme;
    // don't use the configuration as the db may not exist
    r.connect({}, function (err, conn) {
        pheme.info("connected to RethinkDB");
        if (err) return cb(err);
        this.conn = conn;

        // set up the db
        // the idea is that we call create for all of these anyway, and just ignore the errors from
        // the cases in which there is already an item in existence
        var tables = ["user", "event"]
        ,   makeCB = function (cb) { return function () { cb(); }; }
        ,   setup = [
                // create db
                function (cb) { r.dbCreate(db).run(conn, makeCB(cb)); }
                // use it
            ,   function (cb) { conn.use(db); cb(); }
            ]
        ;
        // create all tables
        tables.forEach(function (t) {
            setup.push(
                function (cb) { r.tableCreate(t).run(conn, makeCB(cb)); }
            );
        });
        async.series(setup, cb);
    }.bind(this));
}
RethinkStore.prototype = {
    add:    function (type, data, cb) {
        this.pheme.info("Inserting " + type + " id=" + data.id);
        return r.table(type)
                .insert(data)
                .run(this.conn, cb)
        ;
    }
,   addUnlessExists:    function (type, data, cb) {
        return this.get(type, data.id, function (err, doc) {
                    if (err) return cb(err);
                    if (doc) return cb(); // the document exists, there is nothing to do
                    return this.add(type, data, cb);
                }.bind(this))
        ;
    }
,   get:    function (type, id, cb) {
        return r.table(type)
                .get(id)
                .run(this.conn, cb)
        ;
    }
};

module.exports = RethinkStore;
