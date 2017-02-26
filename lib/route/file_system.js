var fsys = require('../filesystem');
var db = require('../db');

var current;

module.exports = function (app) {

    // GETS
    app.get('/file_system(/:error)?',
            require('connect-ensure-login').ensureLoggedIn(),
            function (req, res) {
                db.sqlite.getRootFolder(function (err_rf, rows_rf) {
                    var rfPath = err_rf ? fsys.filesystem.getUserHome() : rows_rf[0].PATH;
                    current = (req.query.fs ? current + '/' + req.query.fs : rfPath);
                    current = fsys.filesystem.normalize(current);
                    if (!fsys.filesystem.exists(current) || !fsys.filesystem.isDirectory(current) || !current.startsWith(rfPath)) {
                        res.redirect('/file_system/Invalid or illegal path');
                        return;
                    }
//                    console.log(fsys.filesystem.getAccessPermissions(current));
                    fsys.filesystem.listFiles(current, function (err_lf, results_lf) {
                        if (!err_lf && current != rfPath) {
                            results_lf.files.unshift({
                                name: '..',
                                isDir: true
                            });
                        }
                        res.render('file_system', {
                            user: req.user,
                            files: err_lf ? [] : results_lf,
                            root_folder: rfPath,
                            error: req.params.error
                        });
                    });
                });
            });

    // POSTS
    app.post('/set_root_folder',
            require('connect-ensure-login').ensureLoggedIn(),
            function (req, res) {
                var root_folder = req.body.root_folder;
                if (!fsys.filesystem.exists(root_folder) || !fsys.filesystem.isDirectory(root_folder)) {
                    res.redirect('/file_system/File is not a folder or does not exists');
                    return;
                }

                db.sqlite.setRootFolder(root_folder, function (err) {
                    if (err) {
                        res.redirect('/file_system/Failed updating root folder' + err);
                        return;
                    }
                    res.redirect('/file_system');
                });
            });
};