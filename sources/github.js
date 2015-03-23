
var gwh = require("github-webhook-handler");

function GitHub (conf, pheme) {
    this.pheme = pheme;
    this.name = conf.name || "GitHub";
    this.path = conf.path || "/hook";
    if (!conf.secret) throw(new Error("Missing field: secret"));
    this.handler = gwh({ path: this.path, secret: this.secret });
    this.handler.on("error", function (err) {
        pheme.warn(err);
    });
    // https://developer.github.com/webhooks/
    //  note that we don't track everything
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
        this.on(event, function (evt) {
            var acl = "public";
            if (evt.repository && evt.repository.private) acl = "team";
            pheme.store.add({
                    time:       (new Date).toISOString()
                ,   id:         "github-" + evt.id
                ,   type:       "github"
                ,   source:     evt.repository ? evt.repository.full_name : evt.organization.login
                ,   acl:        acl
                ,   payload:    evt.payload
            });
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

