
var gwh = require("github-webhook-handler")
,   ghs = require("github-hook-simplify")
,   log = require("../lib/log")
;

function GitHub (conf, pheme) {
    this.pheme = pheme;
    // this name must be unique
    if (!conf.name) throw(new Error("Missing field: name"));
    this.name = conf.name;
    this.path = conf.path || "/hook";
    if (!conf.secret) throw(new Error("Missing field: secret"));
    this.handler = gwh({ path: this.path, secret: conf.secret });
    this.handler.on("error", function (err) {
        log.warn(err);
    });
    // https://developer.github.com/webhooks/
    //  note that we don't track everything
    // XXX do we need to check 'status' for updates to the repository? or does the repository
    //      event signal changes? this could matter for private vs pubic repos when changing
    //      when normalising, don't store the stuff being renormalised. just keep the key. then,
    //      if that info is needed, get it straight off GH
    //      PRs can be closed too, depends on action (when merged they're closed, but merged: true)
    
    // XXX
    // should we add:
    //  page_build for gh-pages building
    //  status for things like Travis build updates (https://developer.github.com/v3/repos/statuses/)
    var handledEvents = {};
    [
        "issues"
    ,   "commit_comment"
    ,   "create"
    ,   "delete"
    ,   "fork"
    ,   "gollum"
    ,   "issue_comment"
    ,   "pull_request_review_comment"
    ,   "pull_request"
    ,   "push"
    ,   "repository"
    ].forEach(function (e) {
        handledEvents[e] = true;
    });
    this.handler.on("*", function (evt) {
        if (!handledEvents[evt.event]) return log.info("Ignoring GH event " + evt.event);
        log.info("Processing GH event " + evt.event);
        var acl = "public"
        ,   payload = evt.payload
        ;
        if (evt.repository && evt.repository.private) acl = "team";
        payload.github_event_type = evt.event;

        // simplify the payload, GitHub is very verbose
        ghs(evt.event, payload);
        
        pheme.store.add(
                {
                    time:       (new Date).toISOString()
                ,   id:         "github-" + evt.id
                ,   origin:     "github"
                ,   type:       "event"
                ,   event:      evt.event
                ,   source:     payload.repository ? payload.repository.full_name : payload.organization.login
                ,   acl:        acl
                ,   payload:    payload
                }
            ,   function (err) {
                    if (err) log.error(err);
                }
        );
    });
}
GitHub.prototype = {
    handle: function (req, res, next) {
        this.handler(req, res, next);
    }
};

exports.method = "push";
exports.createSource = function (conf, pheme) {
    return new GitHub(conf, pheme);
};
