
var express = require("express")
,   exwin = require("express-winston")
,   session = require("express-session")
,   bp = require("body-parser")
,   sua = require("superagent")
,   async = require("async")
,   FileStore = require("session-file-store")(session)
,   cors = require("cors")
,   log = require("./log")
,   jn = require("path").join
,   eventFilter = require("./filters/events")
,   version = require("../package.json").version
;


module.exports = function (pheme, cb) {
    // set up the server
    var app = express();
    
    // middleware
    app.use(exwin.logger({
        winstonInstance:    log
    ,   expressFormat:      true
    }));
    var corsOptions = {
        origin:         true
    ,   credentials:    true
    ,   method:         ["GET", "PUT", "POST", "DELETE"]
    };
    app.use(cors(corsOptions));
    app.options("*", cors(corsOptions));

    // sessions
    app.use(session({
        store:              new FileStore({
                                    path:   jn(pheme.dataDir, "sessions")
                                ,   ttl:    60 * 60 * 24 * 7
                            })
    ,   cookie:             { maxAge: 1000 * 60 * 60 * 24 * 365 }
    ,   name:               "pheme"
    ,   resave:             false
    ,   rolling:            true
    ,   saveUninitialized:  false
    ,   secret:             "nihil est sine ratione"
    }));
    
    // root service
    app.get("/", function (req, res) {
        res.json({ ok: true, server: "Pheme", version: version });
    });
    
    // get current user (if it has a session)
    app.get("/api/user", function (req, res) {
        log.info("Getting user");
        if (req.session.username) {
            log.info("Matching session for " + req.session.username);
            pheme.store.getUser(req.session.username, function (err, user) {
                if (err || !user) return res.json({ ok: false });
                res.json(user);
            });
        }
        else {
            log.info("No active session");
            res.json({ ok: false });
        }
    });
    // update user preferences
    app.put("/api/user/filters", bp.json(), function (req, res) {
        log.info("Updating user's filters");
        if (req.session.username) {
            pheme.store.getUser(req.session.username, function (err, user) {
                if (err || !user) return res.json({ ok: false });
                user.filters = req.body;
                pheme.store.update(user, function (err) {
                    if (err) return res.json({ ok: false });
                    res.json({ ok: true });
                });
            });
        }
        else {
            log.info("No active session");
            res.json({ ok: false });
        }
    });
    // login
    app.post("/api/user", bp.json(), function (req, res) {
        //  auth against W3C (team and member)
        var authed = {};
        function login (user) {
            req.session.username = user.username;
            req.session.acl = user.acl;
            return res.json(user);
        }
        function auth (acl, path, cb) {
            sua.head("https://www.w3.org/" + path)
                .auth(req.body.username, req.body.password)
                .end(function (err) {
                    log.info("Response for " + acl + ": " + !err);
                    authed[acl] = !err;
                    if (Object.keys(authed).length >= 2) cb(authed);
                });
        }
        function handleAuthed (authed) {
            // if both are false the login is just a failure
            if (!authed.team && !authed.public) return res.json({ ok: false });
            // login succeeded, load from DB
            pheme.store.getUser(req.body.username, function (err, user) {
                // if not in DB, create
                if (err || !user) {
                    log.info("Creating user " + req.body.username + " with team=" + authed.team);
                    var user = {
                        username:   req.body.username
                    ,   id:         "user-" + req.body.username
                    ,   type:       "user"
                    ,   acl:        authed.team ? "team" : "public"
                    };
                    pheme.store.add(user, function (err) {
                            // unexplained error
                            if (err) {
                                log.error(err);
                                return res.json({ ok: false });
                            }
                            login(user);
                        }
                    );
                }
                else login(user);
            });
            
        }
        log.info("Authenticating user " + req.body.username);
        auth("team", "Team/", handleAuthed);
        auth("public", "Member/", handleAuthed);
    });
    // logout
    app.delete("/api/user", function (req, res) {
        req.session.destroy();
        res.json({ ok: true });
    });
    
    // events
    app.get("/api/events", function (req, res) {
        res.json(eventFilter);
    });
    app.get("/api/events/:name", function (req, res) {
        pheme.store.listEvents(req.params.name, {}, function (err, docs) {
            if (err) return res.json(err);
            if (!req.session || req.session.acl !== "team")
                docs = docs.filter(function (doc) { return doc.acl === "public"; });
            res.json({ payload: docs });
        });
    });
    // :since is the key date format separated by ,
    app.get("/api/events-updates/:since", function (req, res) {
        var key = req.params.since.split(",").map(function (it) { return parseInt(it, 10); });
        pheme.store.listUpdates(key, function (err, docs) {
            if (err) return res.json(err);
            res.json(docs);
        });
    });
    app.post("/api/events-since", bp.json(), function (req, res) {
        var checks = [];
        for (var k in req.body) checks.push({ filter: k, since: req.body[k] });
        async.map(
            checks
        ,   function (item, cb) {
                pheme.store.listEvents(item.filter, { since: item.since }, function (err, docs) {
                    if (err) return cb(null, { filter: item.filter, count: 0 });
                    if (!req.session || req.session.acl !== "team")
                        docs = docs.filter(function (doc) { return doc.acl === "public"; });
                    cb(null, { filter: item.filter, count: docs.length });
                });
            }
        ,   function (err, data) {
                var ret = {};
                data.forEach(function (it) { ret[it.filter] = it.count; });
                res.json(ret);
            }
        );
    });
    
    cb(null, app);
};
