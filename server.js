var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('./db');
var port = 3000;

passport.use(new Strategy(
        function (username, password, cb) {
            db.sqlite.getUser(username, function (err, user) {
                if (err) {
                    return cb(err);
                }
                if (!user) {
                    return cb(null, false);
                }
                if (user.PASSWD != db.utils.hash(password, user.SEL)) {
                    return cb(null, false);
                }
                return cb(null, user);
            });
        }));

passport.serializeUser(function (user, cb) {
    cb(null, user.NAME);
});

passport.deserializeUser(function (name, cb) {
    db.sqlite.getUser(name, function (err, user) {
        if (err) {
            return cb(err);
        }
        cb(null, user);
    });
});

// Create a new Express application.
var app = express();

// Configure view engine to render Jade templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({extended: true}));
app.use(require('express-session')({secret: 'keyboard cat', resave: false, saveUninitialized: false}));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public'));

// Regular expression pattern for user names and passwords
var pattName = /\w{3}\w*/;
var pattPass = /\S{6}\S*/;

// Define routes.
app.get('/',
        function (req, res) {
            res.render('home', {user: req.user});
        });

app.get('/login(/:error)?',
        function (req, res) {
            res.render('login', {user: req.user, error: req.params.error});
        });

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

app.get('/settings(/:error)?',
        require('connect-ensure-login').ensureLoggedIn(),
        function (req, res) {
            res.render('settings', {user: req.user, error: req.params.error});
        });


app.post('/login', passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login/error'}));

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

app.get('/logout',
        function (req, res) {
            req.logout();
            res.redirect('/');
        });

app.listen(port);
