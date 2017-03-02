var filesystem = require('../filesystem');
var util = require('./util');

var FileCookieStore = require("tough-cookie-filestore");
//var CookieJar = require("tough-cookie").CookieJar;
var request = require('request');

exports.Register = function (login, pwd) {
    var cookieFile = getCookieFile();
    filesystem.filesystem.touch(cookieFile);
    var j = request.jar(new FileCookieStore(cookieFile));
    request = request.defaults({jar: j});
    request(getRegisterURL(login, pwd), function (err, resObj, resBody) {
        console.log("-- err -- " + err);
        console.log("-- resObj -- " + resObj);
        console.log("-- resBody -- " + resBody);
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