
var gwh = require("github-webhook-handler");

function GitHub (conf, pheme) {
    this.pheme = pheme;
    // this name must be unique
    if (!conf.name) throw(new Error("Missing field: name"));
    this.name = conf.name;
    this.path = conf.path || "/hook";
    if (!conf.secret) throw(new Error("Missing field: secret"));
    this.handler = gwh({ path: this.path, secret: conf.secret });
    this.handler.on("error", function (err) {
        pheme.warn(err);
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
    //  status for things like Travis build updates
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
    ].forEach(function (event) {
        this.handler.on(event, function (evt) {
            pheme.info("received event=" + event);
            var acl = "public"
            ,   payload = evt.payload
            ;
            if (evt.repository && evt.repository.private) acl = "team";
            payload.github_event_type = event;

            // simplify the payload, GitHub is very verbose
            if (payload.sender) payload.sender = payload.sender.login;
            if (payload.organization) payload.organization = payload.organization.login;
            if (event === "repository") payload.repository.owner = payload.repository.owner.login;
            else payload.repository = payload.repository.full_name;
            if (payload.forkee) payload.forkee.owner = payload.forkee.owner.login;
            if (payload.pull_request) {
                payload.pull_request.user = payload.pull_request.user.login;
                if (payload.pull_request.head) {
                    payload.pull_request.head.user = payload.pull_request.head.user.login;
                    payload.pull_request.head.repo = payload.pull_request.head.repo.full_name;
                }
                if (payload.pull_request.base) {
                    payload.pull_request.base.user = payload.pull_request.base.user.login;
                    payload.pull_request.base.repo = payload.pull_request.base.repo.full_name;
                }
            }
            if (payload.issue) payload.issue.user = payload.issue.user.login;
            if (payload.comment) payload.comment.user = payload.comment.user.login;
            if (event === "issue_comment") payload.issue = payload.issue.number;
            
            // var data = {
            //         time:       (new Date).toISOString()
            //     ,   id:         "github-" + evt.id
            //     ,   type:       "github"
            //     ,   source:     payload.repository ? payload.repository.full_name : payload.organization.login
            //     ,   acl:        acl
            //     ,   payload:    payload
            // };
            // require("fs").writeFileSync(
            //     require("path").join(pheme.dataDir, data.time + ".json")
            // ,   JSON.stringify(data, null, 4)
            // ,   { encoding: "utf8" }
            // );
            // XXX EODUMP
            pheme.store.add(
                    {
                        time:       (new Date).toISOString()
                    ,   id:         "github-" + evt.id
                    ,   origin:     "github"
                    ,   type:       "event"
                    ,   event:      event
                    ,   source:     payload.repository ? payload.repository.full_name : payload.organization.login
                    ,   acl:        acl
                    ,   payload:    payload
                    }
                ,   function (err) {
                        if (err) pheme.error(err);
                    }
            );
        });
    }.bind(this));
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
