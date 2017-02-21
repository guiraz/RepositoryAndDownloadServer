var db = require('../db');

module.exports = function (app) {

    // GETS
    app.get('/settings(/:error)?',
            require('connect-ensure-login').ensureLoggedIn(),
            function (req, res) {
                res.render('settings', {user: req.user, error: req.params.error});
            });

    // POSTS
    app.post('/set_password',
            require('connect-ensure-login').ensureLoggedIn(),
            function (req, res) {

                var password_1 = req.body.password_1;
                if (password_1.match(pattPass) != password_1) {
                    res.redirect('/settings/error');
                    return;
                }
                var password_2 = req.body.password_2;
                if (password_1 != password_2) {
                    res.redirect('/settings/error');
                    return;
                }

                var guid = db.utils.rand_guid();
                db.sqlite.setPassword(req.user.NAME, db.utils.hash(password_1, guid), guid, function (err) {
                    if (err) {
                        res.redirect('/settings/error');
                        return;
                    }
                    res.redirect('/settings');
                });
            });
};