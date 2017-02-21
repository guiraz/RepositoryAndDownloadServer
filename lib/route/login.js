module.exports = function (app, passport) {
    // GETS
    app.get('/login(/:error)?',
            function (req, res) {
                res.render('login', {user: req.user, error: req.params.error});
            });

    // POSTS
    app.post('/login', passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login/error'}));
};