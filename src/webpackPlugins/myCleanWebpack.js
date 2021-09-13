const fs = require("fs");
const path = require('path');

class MyCleanWebpack {
    constructor(options) {
        this.options = options;
    }
    apply(compiler) {
        if (!compiler.options.output || !compiler.options.output.path) {
            return;
        }
        const outputPath = compiler.options.output.path;
        compiler.hooks.emit.tap('my-clean-webpack-plugin', (compilation) => {
            this.removeDir(outputPath);
          });
    }
    removeDir(dirname) {
        // 直接删除文件夹，如果文件夹不为空会报错，需要递归删除文件和文件夹
        if (fs.existsSync(dirname)) {
            const files = fs.readdirSync(dirname);
            for (const file of files) {
                const realpath = path.join(dirname, file);
                const stat = fs.statSync(realpath);
                if (stat.isDirectory()) {
                    this.removeDir(realpath);
                } else {
                    fs.unlinkSync(realpath);
                }
            }
            fs.rmdirSync(dirname);
        }
    }
}


module.exports = MyCleanWebpack;