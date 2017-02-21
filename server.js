var express = require('express'),
        passport = require('passport'),
        Strategy = require('passport-local').Strategy,
        db = require('./db'),
        app = express(),
        port = 3000,
        pattName = /\w{3}\w*/,
        pattPass = /\S{6}\S*/;

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

// Configure view engine to render pug templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.use(express.static(__dirname + '/public'));

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

// Define routes.

require('./lib/home.js')(app);
require('./lib/login.js')(app, passport);
require('./lib/manage.js')(app);
require('./lib/settings.js')(app);
require('./lib/file_system.js')(app);

app.listen(port);
