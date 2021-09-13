const pluginName = "removeBabelLoaderCache";
const fs = require("fs");
const path = require('path');

class RemoveBabelLoaderCache {
    constructor({ basePath }) {
        this.basePath = basePath;
    }
    apply(compiler) {
        compiler.hooks.environment.tap(pluginName, () => {
            console.log("*** removeBabelLoaderCache environment ***");
            const babelLoaderCachePath = `${this.basePath}/node_modules/.cache/babel-loader`;
            removeDir(babelLoaderCachePath);
        });
    }
}

function removeDir(dirname) {
    // 直接删除文件夹，如果文件夹不为空会报错，需要递归删除文件和文件夹
    if (fs.existsSync(dirname)) {
        const files = fs.readdirSync(dirname);
        for(const file of files) {
            const realpath = path.join(dirname, file);
            const stat = fs.statSync(realpath);
            if(stat.isDirectory()) {
                removeDir(realpath);
            } else {
                fs.unlinkSync(realpath);
            }
        }
        fs.rmdirSync(dirname);
    }
}

module.exports = RemoveBabelLoaderCache;