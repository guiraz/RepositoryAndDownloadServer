var express = require('express'),
        passport = require('passport'),
        Strategy = require('passport-local').Strategy,
        db = require('./db'),
        app = express(),
        port = 3000;

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

require('./lib/home.js')(app);
require('./lib/login.js')(app, passport);
require('./lib/manage.js')(app);
require('./lib/settings.js')(app);
        
app.listen(port);
