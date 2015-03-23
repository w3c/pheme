
var FeedParser = require("feedparser")
,   request = require("request")
;

function RSS (conf, pheme) {
    this.pheme = pheme;
    this.name = conf.name || "RSS";
    if (!conf.url) throw(new Error("Missing field: url"));
    this.url = conf.url;
    this.acl = conf.acl || "team";
}
RSS.prototype = {
    poll:   function () {
        var req = request(this.url)
        ,   fp = new FeedParser({ feedurl: this.url })
        ,   pheme = this.pheme
        ,   rss = this
        ;

        req.on("error", function (err) { pheme.warn(err); });
        req.on("response", function (res) {
            if (res.statusCode !== 200) return pheme.warn("RSS response status code for " + this.url + ": " + res.statusCode);
            this.pipe(fp);
        });

        fp.on("error", function (err) { pheme.warn(err); });
        fp.on("readable", function () {
            /* jshint -W084 */
            var item;
            while (item = this.read()) pheme.store.add({
                time:   item.date
            ,   id:     item.guid
            ,   type:   "rss"
            ,   source: rss.url
            ,   acl:    rss.acl
            ,   payload: {
                    title:      item.title
                ,   summary:    item.summary
                ,   content:    item.description
                ,   link:       item.link
                ,   tags:       item.categories
                ,   lang:       item.meta.language
                }
            });
        });
    }
};

exports.method = "poll";
exports.interval = 60; // in minutes
exports.createSource = function (conf, pheme) {
    return new RSS(conf, pheme);
};

