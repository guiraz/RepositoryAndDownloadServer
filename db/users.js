var sqlite = require("./sqlite");

exports.findByUsername = function (username, cb) {
    process.nextTick(function () {
        sqlite.getUser(username, function(err, row){
            if(err){
                return cb(err);
            }
            else {
                return cb(null, row);
            }
        });
    });
};