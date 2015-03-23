
function RSS (conf) {
    this.name = conf.name || "RSS";
    if (!conf.url) throw(new Error("Missing field: url"));
    this.url = conf.url;
    this.acl = conf.acl || "team";
}

exports.method = "poll";
exports.interval = 60; // in minutes
exports.createSource = function (conf) {
    return new RSS(conf);
};

