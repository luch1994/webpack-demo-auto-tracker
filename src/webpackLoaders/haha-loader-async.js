module.exports = function (content) {
    const callback = this.async();
    setTimeout(() => {
        callback(null, `export default '${content}';`)
    }, 100);
}