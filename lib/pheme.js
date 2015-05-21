
var winston = require("winston")
,   server = require("./server")
,   fs = require("fs")
,   jn = require("path").join
,   version = require("../package.json").version
,   rfs = function (file) { return fs.readFileSync(file, "utf8"); }
,   wfs = function (file, content) { fs.writeFileSync(file, content, { encoding: "utf8" }); }
,   ensureDir = function (dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir); }
;


function Pheme (conf) {
    this.conf = conf;
    this.server = null;
    this.pollServices = {};
}
Pheme.prototype = {
    init:   function (cb) {
        // data dir
        var dataDir = this.conf.dataDir || "../data";
        if (dataDir.indexOf("/") !== 0) dataDir = jn(__dirname, dataDir);
        ensureDir(dataDir);
        ensureDir(jn(dataDir, "sessions"));
        this.dataDir = dataDir;
        var pheme = this;
        
        // polling memory: get the old one if any and reset
        this.pollMemoryFile = jn(dataDir, "poll-memory.json");
        this.oldPollMemory = fs.existsSync(this.pollMemoryFile) ? rfs(this.pollMemoryFile) : {};
        wfs(this.pollMemoryFile, "{}");
        
        // set up logging
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
        
        // set up store
        var storeConf = this.conf.store;
        if (!storeConf) throw new Error("A store configuration must be specified.");
        var Store = require("./store/" + storeConf.type);
        this.store = new Store(storeConf, this, function () {
            server(pheme, function (err, app) {
                pheme.app = app;
                pheme.server = app.listen(pheme.conf.port || process.env.PORT || 80, function () {
                    var addr = pheme.server.address();
                    pheme.info("Pheme/" + version + " listening at " + addr.address + ":" + addr.port);
                    for (var k in pheme.conf.sources) pheme.loadSource(k, pheme.conf.sources[k]);
                    pheme.startPolling();
                    if (cb) cb();
                });
            });
        });
    }
,   info:   function (msg) { this.log.info(msg); }
,   warn:   function (msg) { this.log.warn(msg); }
,   error:  function (msg) { this.log.error(msg); }
,   loadSource: function (name, instances) {
        var source = require("../sources/" + name);
        instances.forEach(function (conf) {
            var src = source.createSource(conf, this);
            if (source.method === "poll") this.addPollSource(src, source.interval || 60, name);
            else if (source.method === "push") this.addPushSource(src, name);
            else this.error("Unknown method for '" + name + "': " + source.method);
        }.bind(this));
    }
,   addPollSource:  function (src, interval, name) {
        var key = name + ":" + src.name
        ,   now = this.getMinute()
        ,   nextRun = now
        ;
        if (this.oldPollMemory[key] && this.oldPollMemory[key] > now) {
            nextRun = this.oldPollMemory[key];
        }
        this.updatePollService({
                key:        key
            ,   next:       nextRun
            ,   interval:   interval
            ,   service:    src
        });
    }
,   addPushSource:  function (src) {
        this.app.use(src.handle.bind(src));
    }
,   getMinute:  function () {
        return Math.floor(Date.now() / (60 * 1000));
    }
,   startPolling:   function () {
        this.timerID = setInterval(this.poll.bind(this), 60 * 1000);
        this.poll();
    }
,   poll:   function () {
        var now = this.getMinute();
        for (var k in this.pollServices) {
            var ps = this.pollServices[k];
            if (ps.next <= now) {
                ps.next = now + ps.interval;
                this.updatePollService(ps);
                this.info("Triggering poll service " + k);
                ps.service.poll();
            }
        }
    }
,   updatePollService:  function (data) {
        this.pollServices[data.key] = data;
        wfs(this.pollMemoryFile, JSON.stringify(
                                    this.pollServices
                                ,   function (k, v) {
                                        if (k === "service") return undefined;
                                        return v;
                                    }
                                ,   4
                                )
        );
    }
};

module.exports = Pheme;
