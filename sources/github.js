
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
    // XXX add other event types and make them create the right entries
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

