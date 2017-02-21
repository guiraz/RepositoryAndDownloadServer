var db = require('../db');

module.exports = function (app) {

    // GETS
    app.get('/manage(/:error)?',
            require('connect-ensure-login').ensureLoggedIn(),
            function (req, res) {
                db.sqlite.getUsers(function (users_err, users) {
                    if (users_err) {
                        res.render('manage', {user: req.user, users: [], error: req.params.error});
                    }
                    else {
                        res.render('manage', {user: req.user, users: users, error: req.params.error});
                    }
                });
            });

    // POSTS
    app.post('/add_user',
            require('connect-ensure-login').ensureLoggedIn(),
            function (req, res) {

                var userName = req.body.username;
                if (userName.match(pattName) != userName) {
                    res.redirect('/manage/error');
                    return;
                }
                var password_1 = req.body.password_1;
                if (password_1.match(pattPass) != password_1) {
                    res.redirect('/manage/error');
                    return;
                }
                var password_2 = req.body.password_2;
                if (password_1 != password_2) {
                    res.redirect('/manage/error');
                    return;
                }
                var isAdmin = req.body.is_admin;
                if (isAdmin == undefined) {
                    isAdmin = 'FALSE';
                }

                var guid = db.utils.rand_guid();
                db.sqlite.addUser(userName, db.utils.hash(password_1, guid), guid, isAdmin, function (err) {
                    if (err) {
                        res.redirect('/manage/error');
                        return;
                    }
                    res.redirect('/manage');
                });
            });

    app.post('/set_admin_:user_to_update',
            require('connect-ensure-login').ensureLoggedIn(),
            function (req, res) {

                if (req.user.NAME == req.params.user_to_update) {
                    res.redirect('/manage/error');
                    return;
                }

                var isAdmin = req.body.is_admin;
                if (isAdmin == undefined) {
                    isAdmin = 'FALSE';
                }

                db.sqlite.setAdmin(req.params.user_to_update, isAdmin, function (err, users) {
                    if (err) {
                        res.redirect('/manage/error');
                        return;
                    }
                    res.redirect('/manage');
                });
            });

    app.post('/delete_user_:user_to_delete',
            require('connect-ensure-login').ensureLoggedIn(),
            function (req, res) {

                if (req.user.NAME == req.params.user_to_delete) {
                    res.redirect('/manage/error');
                    return;
                }

                db.sqlite.deleteUser(req.params.user_to_delete, function (err) {
                    if (err) {
                        res.redirect('/manage/error');
                        return;
                    }
                    res.redirect('/manage');
                });
            });
};