
var express = require("express")
,   winston = require("winston")
,   session = require("express-session")
,   bp = require("body-parser")
,   sua = require("superagent")
,   FileStore = require("session-file-store")(session)
,   cors = require("cors")
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
        this.store = new Store(storeConf, this);
        
        // set up the server
        this.app = express();
        this.app.get("/", function (req, res) {
            res.json({ ok: true, server: "Pheme", version: version });
        });
        
        // middleware
        var corsOptions = {
            origin:         true
        ,   credentials:    true
        ,   method:         ["GET", "PUT", "POST", "DELETE"]
        };
        this.app.use(cors(corsOptions));
        this.app.options("*", cors(corsOptions));
        this.app.use(bp.json());
        this.app.use(bp.urlencoded({ extended: false }));
        
        // sessions
        this.app.use(session({
            store:              new FileStore({
                                        path:   jn(this.dataDir, "sessions")
                                    ,   ttl:    60 * 60 * 24 * 7
                                })
        ,   cookie:             { maxAge: 1000 * 60 * 60 * 24 * 365 }
        ,   name:               "pheme"
        ,   resave:             false
        ,   rolling:            true
        ,   saveUninitialized:  false
        ,   secret:             "nihil est sine ratione"
        }));
        
        // get current user (if it has a session)
        this.app.get("/api/user", function (req, res) {
            pheme.info("Getting user");
            if (req.session.userID) {
                pheme.info("Matching session for " + req.session.userID);
                pheme.store.get("user", req.session.userID, function (err, user) {
                    if (err) return res.json({ found: false });
                    res.json(user);
                });
            }
            else {
                pheme.info("No active session");
                res.json({ found: false });
            }
        });
        // update user preferences
        this.app.put("/api/user", function () {
            // XXX we don't support updating yet
            // check that we have a user
            // if there's one, update its content with what is provided
            // XXX don't accept acl or id updates
        });
        // login
        this.app.post("/api/user", function (req, res) {
            //  auth against W3C (team and member)
            var authed = {};
            function login (user) {
                req.session.userID = user.id;
                req.session.acl = user.acl;
                return res.json({ found: true, _source: user });
            }
            function auth (acl, path, cb) {
                sua.head("https://www.w3.org/" + path)
                    .auth(req.body.id, req.body.password)
                    .end(function (err) {
                        pheme.info("Response for " + acl + ": " + !err);
                        authed[acl] = !err;
                        if (Object.keys(authed).length >= 2) cb(authed);
                    });
            }
            function handleAuthed (authed) {
                // if both are false the login is just a failure
                if (!authed.team && !authed.public) return res.json({ found: false });
                // login succeeded, load from DB
                pheme.store.get("user", req.body.id, function (err, user) {
                    // if not in DB, create
                    if (err || !user) {
                        pheme.info("Creating user " + req.body.id + " with team=" + authed.team);
                        var user = {
                            id:     req.body.id
                        ,   acl:    authed.team ? "team" : "public"
                        };
                        pheme.store.add("user", user, function (err) {
                                // unexplained error
                                if (err) {
                                    pheme.error(err);
                                    return res.json({ found: false });
                                }
                                login(user);
                            }
                        );
                    }
                    else login(user._source);
                });
                
            }
            pheme.info("Authenticating user " + req.body.id);
            auth("team", "Team/", handleAuthed);
            auth("public", "Member/", handleAuthed);
        });
        // logout
        this.app.delete("/api/user", function (req, res) {
            req.session.destroy();
            res.json({ ok: true });
        });

        this.server = this.app.listen(this.conf.port || process.env.PORT || 80, function () {
            var addr = this.server.address();
            this.info("Pheme/" + version + " listening at " + addr.address + ":" + addr.port);
            for (var k in this.conf.sources) this.loadSource(k, this.conf.sources[k]);
            this.startPolling();
            if (cb) cb();
        }.bind(this));
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
        return Math.floor(Date.now() / 60);
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
