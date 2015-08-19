
var winston = require("winston")
,   conf = require("../config.json")
,   logConf = conf.logs || {}
,   transports = []
;

if (logConf.console) {
    transports.push(
        new (winston.transports.Console)({
                handleExceptions:                   true
            ,   colorize:                           true
            ,   maxsize:                            200000000
            ,   humanReadableUnhandledException:    true
        })
    );
}
if (logConf.file) {
    transports.push(
        new (winston.transports.File)({
                    filename:                           logConf.file
                ,   handleExceptions:                   true
                ,   timestamp:                          true
                ,   humanReadableUnhandledException:    true
        })
    );
}
module.exports = new (winston.Logger)({ transports: transports });
