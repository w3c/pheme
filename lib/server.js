


var express = require("express")
,   exwin = require("express-winston")
,   session = require("express-session")
,   bp = require("body-parser")
,   sua = require("superagent")
,   FileStore = require("session-file-store")(session)
,   cors = require("cors")
,   jn = require("path").join
,   version = require("../package.json").version
;


module.exports = function (pheme, cb) {
    // set up the server
    var app = express();
    
    // middleware
    app.use(exwin.logger({
        winstonInstance:    pheme.log
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
    app.put("/api/user", function () {
        // XXX we don't support updating yet
        // check that we have a user
        // if there's one, update its content with what is provided
        // XXX don't accept acl or id updates
    });
    // login
    app.post("/api/user", bp.json(), function (req, res) {
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
    app.delete("/api/user", function (req, res) {
        req.session.destroy();
        res.json({ ok: true });
    });
    cb(null, app);
};
