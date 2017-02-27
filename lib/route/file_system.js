var fsys = require('../filesystem');
var db = require('../db');

module.exports = function (app) {

    var rootPath;
    var current;
    
    // GETS
    app.get('/file_system(/:error)?',
            require('connect-ensure-login').ensureLoggedIn(),
            function (req, res) {
                db.sqlite.getRootFolder(function (err_rf, rows_rf) {
                    rootPath = err_rf ? fsys.filesystem.getUserHome() : rows_rf[0].PATH;
                    current = req.params.error ? current : rootPath;
                    current = fsys.filesystem.normalize(current);
                    if (!fsys.filesystem.exists(current) || !fsys.filesystem.isDirectory(current) || !current.startsWith(rootPath)) {
                        current = rootPath;
                    }
                    res.render('file_system', {
                        user: req.user,
                        root_folder: rootPath,
                        current: current,
                        error: req.params.error
                    });
                });
            });

    app.get('/list_files',
            require('connect-ensure-login').ensureLoggedIn(),
            function (req, res) {
                var tempCurrent = req.query.fs;
                tempCurrent = fsys.filesystem.normalize(tempCurrent);
                if (!fsys.filesystem.exists(tempCurrent) || !fsys.filesystem.isDirectory(tempCurrent) || !tempCurrent.startsWith(rootPath)) {
                    res.redirect('/file_system/Invalid or illegal path');
                    return;
                }
                fsys.filesystem.listFiles(tempCurrent, function (err_lf, results_lf) {
                    if(err_lf){
                        res.redirect('/file_system/Failed to load files');
                        return;
                    }
                    current = tempCurrent;
                    if (current != rootPath) {
                        results_lf.files.unshift({
                            name: '..',
                            isDir: true,
                            size: fsys.filesystem.getFileSizeString(current + "/.."),
                            perm: fsys.filesystem.getAccessPermissions(current + "/..")
                        });
                    }
                    results_lf.current = current;
                    res.json(results_lf);
                });
            });

    // POSTS
    app.post('/set_root_folder',
            require('connect-ensure-login').ensureLoggedIn(),
            function (req, res) {
                if(req.user.ADMIN != "TRUE"){
                    res.redirect("/file_system/You don't have permission to set the root folder");
                    return;
                }
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