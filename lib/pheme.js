
var express = require("express")
,   app = express()
,   winston = require("winston")
,   jn = require("path").join
;

function Pheme (conf) {
    this.conf = conf;
    this.server = null;
}
Pheme.prototype = {
    init:   function (cb) {
        var logConf = this.conf.logs || {}
        ,   transports = []
        ;
        if (logConf.console) {
            transports.push(
                new (winston.transports.Console)({
                        handleExceptions:                   true
                    ,   colorize:                           true
                    ,   maxsize:                            200000000
                    ,   humanReadableUnhandledException:    true
                })
            );
        }
        if (logConf.file) {
            transports.push(
                new (winston.transports.File)({
                            filename:                           jn(__dirname, logConf.file)
                        ,   handleExceptions:                   true
                        ,   timestamp:                          true
                        ,   humanReadableUnhandledException:    true
                })
            );
        }
        this.log = new (winston.Logger)({ transports: transports });
        this.server = app.listen(this.conf.port || process.env.PORT || 80, function () {
            // here log the fact that we're listening
            // this.server.address().{port, address} give info
            for (var k in this.conf.sources) this.loadSource(k, this.conf.sources[k]);
            cb();
        });
    }
,   info:   function (msg) { this.log.info(msg); }
,   warn:   function (msg) { this.log.warn(msg); }
,   error:  function (msg) { this.log.error(msg); }
,   loadSource: function (name, instances) {
        var Source = require("../sources/" + name);
        instances.forEach(function (conf) {
            var src = new Source(conf, this);
            if (Source.method === "poll") this.addPollSource(src, Source.interval || 60);
            else if (Source.method === "push") this.addPushSource(src);
            else this.error("Unknown method for '" + name + "': " + Source.method);
        }.bind(this));
    }
,   addPollSource:  function (src, interval) {
        // XXX
    }
,   addPushSource:  function (src) {
        // XXX
        // probably this.server add a route somehow
    }
};

module.exports = Pheme;

// ensure directory structure is acceptable
// expose basic functionality so that the server really is just a shell

// load sources
