var sqlite3 = require('sqlite3').verbose();
var fs = require("fs");
var utils = require("./utils");

var file = process.cwd() + "/db/server.db";
var exists = fs.existsSync(file);

exports.getUser = function (name, cb) {
    var sql = new sqlite3.Database(file);
    sql.serialize(function () {
        var query = "SELECT * FROM USERS WHERE NAME='" + name + "'";
        sql.get(query, function (err, row) {
            if (err) {
                cb(err);
            } else {
                cb(row);
            }
        });
    });
    sql.close();
};

function createDb() {
    var db;
    var createTable = function () {
    };
    var insertRows = function () {
    };

    if (!exists) {
        db = new sqlite3.Database(file, 'OPEN_CREATE', createTable);
        db.serialize(function () {
            var cmd = "CREATE TABLE 'USERS' ('NAME' VARCHAR PRIMARY KEY UNIQUE NOT NULL, 'PASSWD' VARCHAR NOT NULL, 'SEL' VARCHAR NOT NULL)";
            db.run(cmd, insertRows);

            var guid = utils.rand_guid();
            var hash = utils.hash("alpine", guid);
            db.run("INSERT INTO USERS VALUES ('root', '" + hash + "', '" + guid + "' )");
        });
        
        db.close();
    }
}

createDb();