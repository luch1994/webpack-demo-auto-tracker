### 为什么要做这个？
1. 为了学习开发babel和webpack插件
2. 埋点是我们前端同学在开发过程中经常需要加的，每个项目或多或少都有埋点的需求，我们能否通过自动化的方式在我们的项目中添加埋点呢？

### 具体是要实现什么？
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
<style lang="scss" rel="stylesheet/scss" scoped>
  
</style>
```
如上面的一段代码，有一个```onItemClick_track```这样一个方法，以```_track```结尾的函数，自动加上埋点的代码``` this.$track('onItemClick_track', { arg2: arg2, arg2: arg2 }); ```


### 实现
具体的实现，是开发一个babel插件，下面我们开始实现


```javascript
function square(n) {
  return n * n;
}
```
node.value如下
```
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


