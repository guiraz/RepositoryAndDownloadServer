var fs = require("fs");
var path_mod = require("path");
var username = require('username');

exports.listFiles = function (path, cb) {
    fs.readdir(path, 'utf8', function (err, files) {
        if (err) {
            cb(err);
        } else {
            var result = {
                files: []
            };
            for (var file in files) {
                var file_path = join(path, files[file]);
                result.files.push({
                    name: files[file],
                    isDir: isDirectory(file_path),
                    size: getFileSizeString(file_path),
                    perm: getAccessPermissions(file_path)
                });
            }
            cb(null, result);
        }
    });
};

exports.getUserHome = function () {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
};

exports.getUserName = function () {
    return username.sync();
};

exports.exists = function (path) {
    return fs.existsSync(path);
};

var isDirectory = function (path) {
    try {
        return fs.statSync(path).isDirectory();
    } catch (e) {
        return false;
    }
};
exports.isDirectory = isDirectory;

exports.isFile = function (path) {
    try {
        return fs.statSync(path).isFile();
    } catch (e) {
        return false;
    }
};

exports.normalize = function (path) {
    return path_mod.normalize(path);
};

var join = function (path, fileName) {
    return path_mod.join(path, fileName);
};
exports.join = join;

var getFileSizeString = function (path) {
    var size;
    try {
        size = fs.statSync(path).size;
    } catch (e) {
        return "nc";
    }
    size = fs.statSync(path).size;
    var a = ["o", "ko", "Mo", "Go"];
    for (var i = 0; i < a.length; i++) {
        if (size < 1000) {
            return size.toString() + " " + a[i];
        }
        size /= 1000;
        size = size.toFixed(2);
    }
    return size.toString() + " To";
};
exports.getFileSizeString = getFileSizeString;

var getAccessPermissions = function (path) {
    try {
        var mode = getMode(path);
    } catch (e) {
        return "unreadable";
    }
    var result = "";
    result += checkPermission(mode, 4, 0);
    result += checkPermission(mode, 2, 0);
    result += checkPermission(mode, 1, 0);
    result += " | ";
    result += checkPermission(mode, 4, 1);
    result += checkPermission(mode, 2, 1);
    result += checkPermission(mode, 1, 1);
    result += " | ";
    result += checkPermission(mode, 4, 2);
    result += checkPermission(mode, 2, 2);
    result += checkPermission(mode, 1, 2);
    return result;
};
exports.getAccessPermissions = getAccessPermissions;

getMode = function (path) {
    return fs.statSync(path).mode;
};

checkPermission = function (mode, accessMask, accessorMask) {
    switch ((accessMask & parseInt((mode & parseInt("777", 8)).toString(8)[accessorMask])).toString()) {
        case "1":
            return "x";
        case "2":
            return "w";
        case "4":
            return "r";
        default :
            return "-";
    }
};