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
                cb(err, null);
            } else {
                cb(null, row);
            }
        });
    });
    sql.close();
};

exports.getUsers = function (cb) {
    var sql = new sqlite3.Database(file);
    sql.serialize(function () {
        var query = "SELECT * FROM USERS";
        sql.all(query, function (err, rows) {
            if (err) {
                cb(err);
            } else {
                cb(null, rows);
            }
        });
    });
    sql.close();
};

exports.setAdmin = function (name, isAdmin, cb){
    var sql = new sqlite3.Database(file);
    sql.serialize(function () {
        var query = "UPDATE USERS SET ADMIN = '" + isAdmin + "' WHERE NAME = '" + name + "'";
        sql.run(query, function (err) {
            if (err) {
                cb(err);
            } else {
                cb(null);
            }
        });
    });
    sql.close();
};

exports.setPassword = function (name, hash, guid, cb){
    var sql = new sqlite3.Database(file);
    sql.serialize(function () {
        var query = "UPDATE USERS SET PASSWD = '" + hash + "', SEL = '" + guid + "' WHERE NAME = '" + name + "'";
        sql.run(query, function (err) {
            if (err) {
                cb(err);
            } else {
                cb(null);
            }
        });
    });
    sql.close();
};

exports.addUser = function (name, hash, guid, isAdmin, cb){
    var sql = new sqlite3.Database(file);
    sql.serialize(function () {
        var query = "INSERT INTO USERS VALUES ('" + name + "', '" + hash + "', '" + guid + "', '" + isAdmin + "' )";
        sql.run(query, function (err) {
            if (err) {
                cb(err);
            } else {
                cb(null);
            }
        });
    });
    sql.close();
};

exports.deleteUser = function (name, cb){
    var sql = new sqlite3.Database(file);
    sql.serialize(function () {
        var query = "DELETE FROM USERS WHERE NAME = '" + name + "'";
        sql.run(query, function (err) {
            if (err) {
                cb(err);
            } else {
                cb(null);
            }
        });
    });
    sql.close();
};

exports.getFolders = function (cb) {
    var sql = new sqlite3.Database(file);
    sql.serialize(function () {
        var query = "SELECT * FROM ROOT_FOLDERS";
        sql.all(query, function (err, folders) {
            if (err) {
                cb(err);
            } else {
                cb(null, folders);
            }
        });
    });
    sql.close();
};

exports.addFolder = function (folder, cb){
    var sql = new sqlite3.Database(file);
    sql.serialize(function () {
        var query = "INSERT INTO ROOT_FOLDERS (FOLDER) VALUES ('" + folder + "')";
        sql.run(query, function (err) {
            if (err) {
                cb(err);
            } else {
                cb(null);
            }
        });
    });
    sql.close();
};

exports.deleteFolder = function (id, cb){
    var sql = new sqlite3.Database(file);
    sql.serialize(function () {
        var query = "DELETE FROM ROOT_FOLDERS WHERE ID = '" + id + "'";
        sql.run(query, function (err) {
            if (err) {
                cb(err);
            } else {
                cb(null);
            }
        });
    });
    sql.close();
};

function createDb() {
    var db;
    
    if (!exists) {
        db = new sqlite3.Database(file, 'OPEN_CREATE');
        db.serialize(function () {
            var cmd = "CREATE TABLE 'USERS' ('NAME' VARCHAR PRIMARY KEY UNIQUE NOT NULL, 'PASSWD' VARCHAR NOT NULL, 'SEL' VARCHAR NOT NULL, 'ADMIN' BOOLEAN DEFAULT 'FALSE' NOT NULL)";
            db.run(cmd);
            
            cmd = "CREATE TABLE 'ROOT_FOLDERS' ('ID' INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE DEFAULT '0' NOT NULL, 'FOLDER' VARCHAR UNIQUE NOT NULL)";
            db.run(cmd);

            var guid = utils.rand_guid();
            cmd = "INSERT INTO USERS VALUES ('root', '" + utils.hash("alpine", guid) + "', '" + guid + "', 'TRUE' )";
            db.run(cmd);
        });
        
        db.close();
    }
}

createDb();