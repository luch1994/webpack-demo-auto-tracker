# webpack核心概念理解

webpack的<a href="https://webpack.docschina.org/concepts/">官方文档</a>本身已经有了文档，但是还要写这个，是要写下自己的一些理解和做一些补充

## 一般概念

### entry

webpack打包的入口文件，一般使用字符串（路径），多个页面可以使用对象，对象的key即文件名

### output

一个对象，webpack打包出来的文件，可以配置文件名和路径

* 直接配置 ```{ output: { filename: 'bundle.js' } }``` 则，打包出来的文件，默认的会在dist目录下生成bundle.js

* 也可以指定path，```{ output: { filename: 'bundle.js', path: __dirname + '/dist' } }``` 指定打包到那个哪个文件夹

* 多入口的话，output是必须使用占位符，```{ output: { filename: '[name].[hash]bundle.js', path: __dirname + '/dist' } }``` 其中的name和hash就是占位符

* 如果使用了htmlWebpackPlugin，生成html的时候，如果想要引用的js的域名是cdn的域名，还可以配置publicPath

  ```{ output: { filename: '[name].[hash]bundle.js', path: __dirname + '/dist', publicPath: 'http://cdn.example.com/assets/[hash]/' } }```

### mode

打包的模式，可选值有 development、production和none，默认是production，当值是development或者production时webpack是会针对特定的模式有特定的优化的，但是如果是none的话将不会有任何优化

### loader

用于对模块的源代码进行转换，即我们可以import非javascript的模块，就是通过loader来 编译的

### plugin

插件可以简单理解为，做那些loader无法做的事

### 模块【module】

我们所有的文件都可以称之为模块

### bundle

打包出来的文件就叫bundle



## chunk

chunk在webpack的官方文档中没有这个介绍，也不是配置里的字段，但是这个却是很重要的一个概念，主要出现在CommonsChunkPlugin（webpack3及之前）和optimization.splitChunks（webpack4及之后）

chunk在webpack中，是指bundle中，关于代码引用的代码片段

webpack在打包过程中，是从entry开始的，我们称为入口模块，入口模块还会引用其他模块，模块还会再引用其他模块，webpack通过引用关系逐个打包模块，这些模块就形成了一个chunk，这一条模块引用的路径就形成了一个chunk

### hash、chunkhash和contenthash有什么区别

* hash针对的是整个项目的hash，项目中的任何一个文件更改都会导致hash改变，所有的output都共用一个hash
* chunkhash，根据上面chunk的学习我们得知，对于一个entry，chunk是有一条模块引用的路径的，只有这条路径上的文件有改动，chunkhash才会变，比如对某一个entry：index，我们设置了分离css文件，打包出来的文件有 index.[chunkhash].js和index.[chunkhash].css，整条chunk的链路上有修改的话，js和css的chunkhash都会一起改变，因为他们都在同一条chunk上
* content hash，针对的是打包出来的内容计算出来的hash，如上面的例子，对某一个entry：index，我们设置了分离css文件，打包出来的文件有 index.[contenthash].js和index.[contenthash].css，我们修改了js的引用，但是没修改，重新打包后，index.[contenthash].js 的contenthash会改变，但是index.[contenthash].css的contenthash不会改变



## 编写一个loader

我们根据官方的[loader api文档](https://webpack.docschina.org/api/loaders/)来自定义开发一个haha-loader

同步的loader，函数返回值是可以执行的js代码

```javascript
module.exports = function (content) {
    return `export default '${content}';`;
}
```

或者

```javascript
module.exports = function (content) {
    const callback = this.async();
    setTimeout(() => {
        callback(null, `export default '${content}';`)
    }, 100);
}
```

我们有一个text.haha的文件，里面的内容是```哈哈哈哈```

在vue某个组件中，我们这样使用

```vue
<template>
  <div >{{ text }}</div>
</template>
<script>
import text from "../assets/text.haha";
export default {
  data() {
    return {
      text,
    };
  },
};
</script>
```

接着就是配置webpack了，webpack这里有个坑，**所有的loader都是只能写字符串**，要先配置loader所在的文件夹，通过```resolveLoader.modules```，loader是配置js的文件名，在vue.config.js中配置如下

```javascript
module.exports = {
    chainWebpack: config => {
        config.resolveLoader.modules
            .add('../src/webpackLoaders');
        config.module
            .rule('haha')
            .test(/.haha$/)
            .use('haha-loader')
            .loader('haha-loader-async')
            .options({});
    }
}
```

执行```npm run serve```后页面打开是符合预期的

## 编写一个plugin

webpack在运行或者打包的过程中，会经历很多个生命周期，我们叫生命周期钩子或者hooks，https://webpack.docschina.org/api/compiler-hooks/

在开发插件之前，我们要明确，**我们想在webpack的什么阶段做什么事**

例如，项目在build的时候，我们经常需要手动删除dist目录，或者引入clean-webpack-plugin，我们也可以自己写一个插件，在文件打包输出到output.path之前把output.path文件夹删除清空

```javascript
const fs = require("fs");
const path = require('path');

class MyCleanWebpack {
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
```

* 首先必须要有apply方法，参数compiler是webpack的主要引擎
* compiler.options就是我们传入的webpack配置
* compiler.hooks.emit表示的是在输出 asset 到 output 目录之前执行，tap表示在这个生命周期下注册这个函数（具体都有哪些声明周期，在什么阶段执行参考文档https://webpack.docschina.org/api/compiler-hooks/ ）
* 如果是异步的插件，则使用tapAsync，参数是 (compilation, callback)，参数执行完毕后，执行```callback()```即可

## babel

### 概念

Babel是JavaScript编译器，一般用于将ES6代码转换成ES5代码，让我们开发过程中放⼼使⽤JS新特性⽽不⽤担⼼兼容性问题

babel执行过程中，会先从根目录下面的.babelrc或者babel.config.js 读取配置，如果没有该文件，会读loader的options里面的配置；babel.config.js是项目级的配置，.babelrc是目录级别的配置

具体详细的说明看官方文档：https://www.babeljs.cn/docs

### 版本

现在大部分使用babel的项目都是用的babel7.x了，但是还是需要去了解一下babel每个版本的一个重大变化

#### babel 5.x

babel5类似于全家桶，包括各种包和插件，babel5目的就是让你通过一次安装，尽可能的可以达到所有你想要的东西。

#### babel 6.x

由于babel5.x一次性把所有东西都安装了，但是实际上很多东西都不需要，babel6.x把一些包和插件拆出来，让用户单独安装

#### babel 7.x

babel7进行了较大的改动，废弃了 `stage-x`的preset，还增加了命名空间区分官方插件和非官方插件，所有的包都是@babel开头的

### 简单使用

安装babel```npm i babel-loader @babel/core @babel/preset-env -D```

* babel-loader是webpack和babel通信的桥梁，不会做代码编译的工作
* @babel/core的作用是把 js 代码分析成 ast ，方便各个插件分析语法进行相应的处理
* @babel/preset-env，包含了es6、7、8转es5的转换规则

我们在webpack的module配置如下

```
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            }
        ]
    }
```

@babel/preset-env只支持一些基础的转换，但是比如promise等是没有做转换的，在低版本的手机上运行时肯定会报错的，这时候就需要借助@babel/polyfill

```bash
npm install @babel/polyfill
```

修改我们的webpack.config.js的babel-loader的options

```json
{
  "options": {
    "presets": [
      [
          "@babel/preset-env",
          {
              "targets": {
                  "esmodules": true
              },
              "corejs": 2,
              "useBuiltIns": "entry"
          }
      ]
  }
}
```

这里几个字段的含义：

* targets：目标浏览器，此处设置 esmodules为true表示编译出来的代码支持浏览器自带的esmodules
* corejs：开源库[zloirock/core-js](https://link.jianshu.com?t=https://link.zhihu.com/?target=https%3A//github.com/zloirock/core-js) 提供了es5、es6的polyfills，包括promises、[symbols](https://link.jianshu.com?t=https://link.zhihu.com/?target=https%3A//github.com/zloirock/core-js%23ecmascript-6-symbol)、[collections](https://link.jianshu.com?t=https://link.zhihu.com/?target=https%3A//github.com/zloirock/core-js%23ecmascript-6-collections)、iterators、[typed arrays](https://link.jianshu.com?t=https://link.zhihu.com/?target=https%3A//github.com/zloirock/core-js%23ecmascript-6-typed-arrays)、[ECMAScript 7+ proposals](https://link.jianshu.com?t=https://link.zhihu.com/?target=https%3A//github.com/zloirock/core-js%23ecmascript-7-proposals)、[setImmediate](https://link.jianshu.com?t=https://link.zhihu.com/?target=https%3A//github.com/zloirock/core-js%23setimmediate) 等等。我们引入了@babel/polyfill就间接使用了corejs，目前有2和3的版本，默认使用2即可，3的版本可以看官方介绍来决定自己的项目需不需要使用，如果需要使用3的版本的话，需要手动安装一下：```npm install core-js@3 --save```
* useBuiltIns：这个是用于配置@babel/preset-env怎么处理polyfills，可选值有：`"usage"` | `"entry"` | `false`, 默认 `false`
  * entry: 需要在 webpack 的⼊⼝⽂件⾥ import "@babel/polyfill" ⼀次。 babel会根据你的使⽤情况导⼊垫⽚，没有使⽤的功能不会被导⼊相应的垫⽚。
  * usage: 不需要 import ，全⾃动检测，但是要安装 @babel/polyfill 。（试验阶段）
  * false: 如果你 import "@babel/polyfill" ，它不会排除掉没有使⽤的垫⽚，程序体积会庞⼤。(不推荐)
* 其他项的配置看看 https://babeljs.io/docs/en/babel-preset-env

### babel插件

#### 说明

Babel 是 JavaScript 编译器，他会先将我们的代码编译成一个AST树，这个可以理解成就是一个对象，然后babel根据拿到的AST树，重新生成一份新的代码返回给我们，重新生成代码的过程就是AST树的处理过程

可以通过这个网站来看我们的代码处理成AST是什么样的：https://astexplorer.net/

处理的结果大致如下：

```javascript
function square(n) {
  return n * n;
}
```

```json
{
  type: "FunctionDeclaration",
  id: {
    type: "Identifier",
    name: "square"
  },
  params: [{
    type: "Identifier",
    name: "n"
  }],
  body: {
    type: "BlockStatement",
    body: [{
      type: "ReturnStatement",
      argument: {
        type: "BinaryExpression",
        operator: "*",
        left: {
          type: "Identifier",
          name: "n"
        },
        right: {
          type: "Identifier",
          name: "n"
        }
      }
    }]
  }
}
```

babel处理的简易过程大家可以参考这篇文章：[超级简单的webpack实现，理解webpack核心原理](https://juejin.cn/post/7004807329023688740)

babel的插件开发也是和上面这篇文章类似

#### 函数插桩，自动埋点，babel插件开发

##### 为什么做这个

1. 学习babel插件开发

2. 埋点是我们前端同学在开发过程中经常需要加的，每个项目或多或少都有埋点的需求，我们能否通过自动化的方式在我们的项目中添加埋点呢？

##### 具体要实现什么？

```vue
<template>
  <div @click="onItemClick_track(1, 2)">我是测试自动埋点的组件1</div>
</template>
<script>
export default {
  methods: {
      onItemClick_track(arg1, arg2) {
        console.log(`进入onItemClick，参数：${arg1}, ${arg1}`);
      }
  }
}
</script>
```

如上面的一段代码，在methods中有一个```onItemClick_track```这样一个方法，我们要给其自动加上埋点的代码``` this.$track('onItemClick_track', { arg2: arg2, arg2: arg2 }); ```

具体要实现的功能就是，所有以_track结尾的函数，都自动加上埋点的代码，这个过程也叫函数插桩

##### 如何开发

```javascript
module.exports = function (babel, options) {
    const { types, template } = babel;
    return {
        name: "add-track-babel-plugin",
        visitor: {
            
        }
    }
}

```

先定义一个函数，函数返回值是一个对象，对象里的visitor，我们可以理解成访问者模式，我们遍历这个ast树，可以理解成访问这个ast树里的节点，visitor访问的就是type

然后我们在根目录的babel.config.js里使用我们的插件，这样就可以了

```javascript
const addTrack = require('../src/babelPlugins/addTrack.js');
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    addTrack
  ]
}
```

##### 开始开发

我们在visitor中定义Identifier，表示每一个type是Identifier的节点，都会进入这个函数，但是visitor接收的参数是path，path和上面js解析出来的AST树还是不太一样

```json
{
  "parent": {
    "type": "FunctionDeclaration",
    "id": {...},
    "value": {...},
    ....
  },
  "node": {
    "type": "Identifier",
    "name": "square"
  }
}
```

所以，我们判断type是Identifier，他的name以 _track结尾，parent的type是FunctionDeclaration即是我们的目标节点

```javascript
module.exports = function (babel, options) {
    const { types, template } = babel;
    return {
        name: "add-track-babel-plugin",
        visitor: {
            Identifier(path, state) {
                const { name } = path.node;
                if (name.endsWith('_track')) {
                    try {
                        const parentNode = path.parent;
                        if (types.isFunctionExpression(parentNode.value)) {
                            // 是我们的目标节点，开始处理的内容...
                        }
                    } catch (error) {

                    }
                }
            },
        }
    }
}
```

拿到我们的节点后，要做的就是：

1. 提取参数
2. 生成埋点的代码
3. 将埋点代码插入函数体中

代码如下：

```javascript
// 提取参数
const params = parentNode.value.params;
// 生成埋点的代码
var s = '{'
params.forEach(p => {
  s = s + p.name + ':' + p.name + ','
});
s = s + 'baseTrackProps: this.baseTrackProps}'
const tName = `'${name}'`
const addCodeStr = `this.$track(${tName},${s})`;
// 将埋点代码插入函数体中
const body = parentNode.value.body;
body.body.unshift(template.statement(addCodeStr)());
```

我们最终的代码如下

```javascript
module.exports = function (babel, options) {
    const { types, template } = babel;
    return {
        name: "add-track-babel-plugin",
        visitor: {
            Identifier(path, state) {
                const { name } = path.node;
                if (name.endsWith('_track')) {
                    try {
                        const parentNode = path.parent;
                        if (types.isFunctionExpression(parentNode.value)) {
                            const params = parentNode.value.params;
                            var s = '{'
                            params.forEach(p => {
                                s = s + p.name + ':' + p.name + ','
                            })
                            s = s + 'baseTrackProps: this.baseTrackProps}'
                            const tName = `'${name}'`
                            const addCodeStr = `this.$track(${tName},${s})`;
                            const body = parentNode.value.body;
                            body.body.unshift(template.statement(addCodeStr)());
                        }
                    } catch (error) {

                    }
                }
            },
        }
    }
}
```



完整的代码地址：



参考文章：

https://juejin.cn/post/6844903889393680392

https://segmentfault.com/a/1190000012828879

https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md