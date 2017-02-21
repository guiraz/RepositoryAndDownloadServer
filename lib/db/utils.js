
exports.hash = function (pass, guid) {
    pass = pass + guid;
    var hash = 0;
    if (pass.length <= 0)
        return hash;
    for (i = 0; i < pass.length; i++) {
        char = pass.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};

exports.rand_guid = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
};