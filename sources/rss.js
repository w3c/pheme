
var FeedParser = require("feedparser")
,   request = require("request")
,   log = require("../lib/log")
;

function RSS (conf, pheme) {
    this.pheme = pheme;
    // this name must be unique
    if (!conf.name) throw(new Error("Missing field: name"));
    this.name = conf.name;
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

        req.on("error", function (err) { log.warn(err); });
        req.on("response", function (res) {
            if (res.statusCode !== 200) return log.warn("RSS response status code for " + this.url + ": " + res.statusCode);
            this.pipe(fp);
        });

        // I suspect leakage
        fp.on("end", function () {
            fp = null;
            req = null;
        });
        fp.on("error", function (err) { log.warn(err); });
        fp.on("readable", function () {
            /* jshint -W084 */
            var item;
            while (item = this.read()) {
                pheme.store.addUnlessExists(
                        {
                            time:   item.date.toISOString()
                        ,   id:     "rss-" + item.guid
                        ,   origin: rss.name
                        ,   type:   "event"
                        ,   event:  "rss"
                        ,   source: rss.url
                        ,   acl:    rss.acl
                        ,   payload: {
                                title:      item.title
                            ,   summary:    item.summary
                            ,   content:    (item.description === item.summary ? null : item.description)
                            ,   link:       item.link
                            ,   tags:       item.categories
                            ,   lang:       item.meta.language
                            }
                        }
                    ,   function (err) {
                            if (err) log.error(err);
                        }
                );
            }
        });
    }
};

exports.method = "poll";
exports.interval = 60; // in minutes
exports.createSource = function (conf, pheme) {
    return new RSS(conf, pheme);
};

