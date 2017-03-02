var url_mod = require('url');

exports.createURL = function (path, query) {
    var url = new url_mod.Url();
    url.protocol = getProtocol();
    url.hostname = getHost();
    url.pathname = path;
    url.query = query;
    return url_mod.format(url);
};

getProtocol = function () {
    return "https:";
};

getHost = function () {
    return "alldebrid.com";
};