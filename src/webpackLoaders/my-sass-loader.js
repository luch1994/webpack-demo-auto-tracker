var sass = require('node-sass');
module.exports = function (content) {
    var callback = this.async();
    sass.render({
        data: content,
    }, function (err, result) {
        if (err) {
            return callback(err)
        };
        callback(null, result);
    });
}