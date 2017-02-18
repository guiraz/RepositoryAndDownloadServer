module.exports = function (app) {

    // GETS
    app.get('/',
            function (req, res) {
                res.render('home', {user: req.user});
            });

    app.get('/logout',
            function (req, res) {
                req.logout();
                res.redirect('/');
            });
};