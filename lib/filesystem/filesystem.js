var fs = require("fs");
var path_mod = require("path");

exports.listFiles = function (path, cb) {
    fs.readdir(path, 'utf8', function (err, files) {
        if (err) {
            cb(err);
        } else {
            var result = {
                files: []
            };
            for (var file in files) {
                result.files.push({
                    name: files[file],
                    isDir: fs.statSync(path_mod.join(path, files[file])).isDirectory()
                });
            }
            cb(null, result);
        }
    });
};

exports.getUserHome = function() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
};

exports.exists = function(path) {
  return fs.existsSync(path);
};

exports.isDirectory = function(path) {
  return fs.statSync(path);
};