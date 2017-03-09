var filesystem = require('../filesystem');
var util = require('./util');
var cheerio = require('cheerio');

var FileCookieStore = require("tough-cookie-filestore");
//var CookieJar = require("tough-cookie").CookieJar;
var request = require('request');

exports.Register = function (login, pwd, cb) {
    var cookieFile = getCookieFile();
    filesystem.filesystem.touch(cookieFile);
    var j = request.jar(new FileCookieStore(cookieFile));
    request = request.defaults({jar: j});
    console.log(getRegisterURL(login, pwd));
    request(getRegisterURL(login, pwd), function (err, resObj, resBody) {
        if (err) {
            filesystem.filesystem.deleteFile(filesystem.filesystem.getUserHome() + "/.alldebrid/index.html", resBody, (err) => {
                cb(err);
                return;
            });
            cb('fail_registering');
            return;
        }
        filesystem.filesystem.writeReplaceTruncate(filesystem.filesystem.getUserHome() + "/.alldebrid/index.html", resBody, (err) => {
            filesystem.filesystem.deleteFile(filesystem.filesystem.getUserHome() + "/.alldebrid/index.html", resBody, (err) => {
                cb(err);
                return;
            });
            cb(err);
            return;
        });
        $ = cheerio.load(resBody);
        if ($('.login_form').find('.error')) {
            filesystem.filesystem.deleteFile(filesystem.filesystem.getUserHome() + "/.alldebrid/index.html", resBody, (err) => {
                cb(err);
                return;
            });
            cb('invalid_credentials');
            return;
        }
    });
};

var getRegisterURL = function (login, pwd) {
    return util.createURL(getRegisterPath(), getRegisterQuery(login, pwd));
};
exports.getRegisterURL = getRegisterURL;

getCookieFile = function () {
    return filesystem.filesystem.getUserHome() + "/.alldebrid/cookie";
};

getRegisterPath = function () {
    return "/register/";
};

getRegisterQuery = function (login, pwd) {
    return {
        action: "login",
        login_login: login,
        login_password: pwd
    };
};