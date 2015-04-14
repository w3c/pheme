
var es = require("elasticsearch");

function ElasticStore (conf, pheme) {
    this.conf = conf;
    this.db = this.conf.db || "pheme";
    this.pheme = pheme;
    this.client = new es.Client(this.conf);
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
        ); // XXX have gh and rss use this properly
    }
    // XXX
    // simple search options
    // only do this after we start building the dashboard
};

module.exports = ElasticStore;
