
var es = require("elasticsearch");

function ElasticStore (conf, pheme, cb) {
    this.conf = conf;
    this.db = this.conf.db || "pheme";
    this.pheme = pheme;
    if (conf.log && conf.log.path && conf.log.path.indexOf("/") !== 0) {
        conf.log.path = require("path").join(__dirname, "../..", conf.log.path);
    }
    this.client = new es.Client(this.conf);
    cb();
}
ElasticStore.prototype = {
    add:    function (type, data, cb) {
        this.client.create(
                {
                    index:  this.db
                ,   type:   type
                ,   id:     data.id
                ,   body:   data
                }
            ,   cb
        );
    }
,   addUnlessExists:    function (type, data, cb) {
        this.client.exists(
                {
                    index:  this.db
                ,   type:   type
                ,   id:     data.id
                }
            ,   function (err, exists) {
                    if (err) return cb(err);
                    if (exists) return cb();
                    return this.add(type, data, cb);
                }.bind(this)
        );
    }
,   get:    function (type, id, cb) {
        this.client.get(
            {
                index:  this.db
            ,   type:   type
            ,   id:     id
            }
        ,   cb
        );
    }
    // XXX
    // simple search options
    // only do this after we start building the dashboard
};

module.exports = ElasticStore;
