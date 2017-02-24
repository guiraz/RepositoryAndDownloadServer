var db = require('../db');
var fs = require('fs');
var pattName = /\w{3}\w*/;
var pattPass = /\S{6}\S*/;

module.exports = function (app) {

    // GETS
    app.get('/manage(/:error)?',
            require('connect-ensure-login').ensureLoggedIn(),
            function (req, res) {
                if(!req.params.error && req.user.ADMIN != 'TRUE'){
                    res.redirect('/manage/You are not authorized to manage');
                    return;
                }
                db.sqlite.getUsers(function (users_err, users) {
                    db.sqlite.getRootFolder(function (root_folder_err, root_folder) {
                        res.render('manage', {
                            user: req.user,
                            users: users_err ? [] : users,
                            root_folder: root_folder_err ? [] : root_folder,
                            error: req.params.error
                        });
                    });
                });
            });

    // POSTS
    app.post('/add_user',
            require('connect-ensure-login').ensureLoggedIn(),
            function (req, res) {

                var userName = req.body.username;
                if (userName.match(pattName) != userName) {
                    res.redirect('/manage/User name does not match pattern');
                    return;
                }
                var password_1 = req.body.password_1;
                if (password_1.match(pattPass) != password_1) {
                    res.redirect('/manage/Password does not match pattern');
                    return;
                }
                var password_2 = req.body.password_2;
                if (password_1 != password_2) {
                    res.redirect('/manage/Comfirmation password does not match first');
                    return;
                }
                var isAdmin = req.body.is_admin;
                if (isAdmin == undefined) {
                    isAdmin = 'FALSE';
                }

                var guid = db.utils.rand_guid();
                db.sqlite.addUser(userName, db.utils.hash(password_1, guid), guid, isAdmin, function (err) {
                    if (err) {
                        res.redirect('/manage/Failed inserting user in database');
                        return;
                    }
                    res.redirect('/manage');
                });
            });

    app.post('/set_admin_:user_to_update',
            require('connect-ensure-login').ensureLoggedIn(),
            function (req, res) {

                if (req.user.NAME == req.params.user_to_update) {
                    res.redirect('/manage/You cannot update your account yourself');
                    return;
                }

                var isAdmin = req.body.is_admin;
                if (isAdmin == undefined) {
                    isAdmin = 'FALSE';
                }

                db.sqlite.setAdmin(req.params.user_to_update, isAdmin, function (err, users) {
                    if (err) {
                        res.redirect('/manage/Failed updating user informations');
                        return;
                    }
                    res.redirect('/manage');
                });
            });

    app.post('/delete_user_:user_to_delete',
            require('connect-ensure-login').ensureLoggedIn(),
            function (req, res) {

                if (req.user.NAME == req.params.user_to_delete) {
                    res.redirect('/manage/You cannot delete your account yourself');
                    return;
                }

                db.sqlite.deleteUser(req.params.user_to_delete, function (err) {
                    if (err) {
                        res.redirect('/manage/Failed deleting user');
                        return;
                    }
                    res.redirect('/manage');
                });
            });

    app.post('/set_root_folder',
            require('connect-ensure-login').ensureLoggedIn(),
            function (req, res) {
                var root_folder = req.body.root_folder;
                if (!fs.existsSync(root_folder) || !fs.statSync(root_folder).isDirectory()) {
                    res.redirect('/manage/File is not a folder or does not exists');
                    return;
                }

                db.sqlite.setRootFolder(root_folder, function (err) {
                    if (err) {
                        res.redirect('/manage/Failed updating root folder' + err);
                        return;
                    }
                    res.redirect('/manage');
                });
            });
};