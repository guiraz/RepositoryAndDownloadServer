var fsys = require('../filesystem');
var db = require('../db');
var debrid = require('../debrid');

module.exports = function (app) {

    var downloadFolder;

    // GETS
    app.get('/debrid(/:error)?',
            require('connect-ensure-login').ensureLoggedIn(),
            function (req, res) {
                db.sqlite.getDownloadFolder(function (err_df, rows_df) {
                    downloadFolder = err_df ? fsys.filesystem.getUserHome() + "Downloads" : rows_df[0].PATH;
                    res.render('debrid', {
                        user: req.user,
                        download_folder: downloadFolder,
                        error: req.params.error
                    });
                });
            });

    // POSTS
    app.post('/set_download_folder',
            require('connect-ensure-login').ensureLoggedIn(),
            function (req, res) {
                if (req.user.ADMIN != "TRUE") {
                    res.redirect("/debrid/You don't have permission to set the download folder");
                    return;
                }
                var download_folder = req.body.download_folder;
                if (!fsys.filesystem.exists(download_folder) || !fsys.filesystem.isDirectory(download_folder)) {
                    res.redirect('/debrid/File is not a folder or does not exists');
                    return;
                }

                db.sqlite.setDownloadFolder(download_folder, function (err) {
                    if (err) {
                        res.redirect('/debrid/Failed updating download folder' + err);
                        return;
                    }
                    res.redirect('/debrid');
                });
            });

    app.post('/debrid',
            require('connect-ensure-login').ensureLoggedIn(),
            function (req, res) {
                var toDebrid = req.body.to_debrid;
                console.log(toDebrid);
                console.log(debrid.register.Register("id", "pass"));
            });
};