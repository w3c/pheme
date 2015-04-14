

function ElasticStore (conf, pheme) {
    this.conf = conf;
    this.pheme = pheme;
    
    // XXX create elastic instance
}
ElasticStore.prototype = {
    add:    function (data, cb) {
        // XXX create
        // cb is not optional, the caller is responsible for handling error
    }
};

module.exports = ElasticStore;
