
// var jsdom = require("jsdom")
// ;

function Minutes (conf, pheme) {
    this.pheme = pheme;
    // this name must be unique
    if (!conf.name) throw(new Error("Missing field: name"));
    this.name = conf.name;
}
Minutes.prototype = {
    poll:   function () {
        // XXX
        //  fetch https://cvs.w3.org/recent-commits?user=swick
        //      this requires Team credentials
        //  parse it with jsdom
        //  grab all td.file > a[href] where the tr > td:last-of-type is either "[RRSAgent] sync" or
        //      "created by RRSAgent using scribe.perl"
        //  for each of those, make a HEAD to get the ACL
        //      note that the ACL might change without CVS knowing, so revisit whole list
        //  for all of those, add if not exists, possibly udpate if the ACL has changed
    }
};

exports.method = "poll";
exports.interval = 10; // in minutes
exports.createSource = function (conf, pheme) {
    return new Minutes(conf, pheme);
};

