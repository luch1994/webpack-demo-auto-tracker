const removeBabelLoaderCache = require('../src/webpackPlugins/removeBabelLoaderCache.js');
module.exports = {
    // configureWebpack: (config) => {
    //     config.plugins.push(new removeBabelLoaderCache({
    //         basePath: __dirname
    //     }));
    // }
    chainWebpack: config => {
        config
            .when(process.env.NODE_ENV === 'development', config => {
                config.plugin('removeBabelLoaderCache').use(new removeBabelLoaderCache({
                    basePath: __dirname
                }));
            });

        config.resolveLoader.modules
            .add('../src/webpackLoaders');
        config.module
            .rule('haha')
            .test(/.haha$/)
            .use('haha-loader')
            .loader('haha-loader-async')
            .options({});
        // config.module
        //     .rule('scss')
        //     .use('my-sass-loader')
        //     .loader('my-sass-loader');
    }
}