var fsys = require('../filesystem');
module.exports = function (app) {

    // GETS
    app.get('/file_system(/:error)?',
            require('connect-ensure-login').ensureLoggedIn(),
            function (req, res) {
                fsys.filesystem.listFiles(getUserHome(), function (err, result) {
                    if (err)
                        res.render('file_system', {user: req.user, error: err});
                    else
                        res.render('file_system', {user: req.user, files: result});
                });

            });
};

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
};