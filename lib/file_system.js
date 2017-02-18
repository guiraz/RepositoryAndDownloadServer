module.exports = function (app) {

    // GETS
    app.get('/file_system(/:error)?',
            require('connect-ensure-login').ensureLoggedIn(),
            function (req, res) {
                res.render('file_system', {user: req.user});
            });
};