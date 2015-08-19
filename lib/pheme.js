
var server = require("./server")
,   Store = require("./store")
,   conf = require("../config.json")
,   log = require("./log")
,   fs = require("fs")
,   jn = require("path").join
,   version = require("../package.json").version
,   rfs = function (file) { return fs.readFileSync(file, "utf8"); }
,   wfs = function (file, content) { fs.writeFileSync(file, content, { encoding: "utf8" }); }
,   ensureDir = function (dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir); }
;


function Pheme () {
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
        
        // set up store
        var storeConf = this.conf.store || {};
        this.store = new Store(storeConf, this);
        server(pheme, function (err, app) {
            pheme.app = app;
            pheme.server = app.listen(pheme.conf.port || process.env.PORT || 80, function () {
                var addr = pheme.server.address();
                log.info("Pheme/" + version + " listening at " + addr.address + ":" + addr.port);
                for (var k in pheme.conf.sources) pheme.loadSource(k, pheme.conf.sources[k]);
                pheme.startPolling();
                if (cb) cb();
            });
        });
    }
,   loadSource: function (name, instances) {
        var source = require("../sources/" + name);
        instances.forEach(function (conf) {
            var src = source.createSource(conf, this);
            if (source.method === "poll") this.addPollSource(src, source.interval || 60, name);
            else if (source.method === "push") this.addPushSource(src, name);
            else log.error("Unknown method for '" + name + "': " + source.method);
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
                log.info("Triggering poll service " + k);
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
