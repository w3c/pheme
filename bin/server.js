
var Pheme = require("..")
,   fs = require("fs")
,   pth = require("path")
,   nopt = require("nopt")
,   knownOpts = {
        config:     pth
    }
,   shortHands = {
        c:      ["--config"]
    }
,   options = nopt(knownOpts, shortHands, process.argv, 2)
;

if (!options.config) options.config = pth.join(__dirname, "../data/config.json");
var conf = JSON.parse(fs.readFileSync(options.config, "utf8"))
,   pheme = new Pheme(conf)
;
pheme.init();
