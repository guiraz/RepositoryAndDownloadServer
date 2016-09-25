var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('./db');

passport.use(new Strategy(
        function (username, password, cb) {
            db.users.findByUsername(username, function (err, user) {
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
    db.users.findByUsername(name, function (err, user) {
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

// Define routes.
app.get('/',
        function (req, res) {
            res.render('home', {user: req.user});
        });

app.get('/login(/:error)?',
        function (req, res) {
            res.render('login', {user: req.user, error: req.params.error});
        });


app.post('/login', passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login/error'}));

app.get('/logout',
        function (req, res) {
            req.logout();
            res.redirect('/');
        });

app.get('/profile',
        require('connect-ensure-login').ensureLoggedIn(),
        function (req, res) {
            res.render('profile', {user: req.user});
        });

app.listen(3000);
