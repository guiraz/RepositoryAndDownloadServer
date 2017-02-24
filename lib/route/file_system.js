var fsys = require('../filesystem');
var db = require('../db');
var path = require('path');

var current;

module.exports = function (app) {

    // GETS
    app.get('/file_system(/:error)?',
            require('connect-ensure-login').ensureLoggedIn(),
            function (req, res) {
                db.sqlite.getRootFolder(function (err_rf, rows_rf) {
                    var rfPath = err_rf ? fsys.filesystem.getUserHome() : rows_rf[0].PATH;
                    current = (req.query.fs ? current + '/' + req.query.fs : rfPath)
                    current = path.normalize(current);
                    if(!fsys.filesystem.exists(current) || !fsys.filesystem.isDirectory(current) || !current.startsWith(rfPath)){
                        res.redirect('/file_system/Invalid or illegal path');
                        return;
                    }
                    fsys.filesystem.listFiles(current, function (err_lf, results_lf) {
                        if(!err_lf && current != rfPath){
                            results_lf.files.unshift({
                                name: '..',
                                isDir: true
                            });
                        }
                        res.render('file_system', {
                            user: req.user,
                            files: err_lf ? [] : results_lf,
                            error: req.params.error
                        });
                    });
                });
            });
};