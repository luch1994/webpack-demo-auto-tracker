const addTrack = require('../src/babelPlugins/addTrack.js');
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    // 其他插件
    addTrack
  ]
}
