<template>
  <div id="app">
    <img class="logo" alt="Vue logo" src="./assets/logo.png">
    <Test />
  </div>
</template>

<script>
import Test from "./components/Test.vue";
console.log(Test)
console.log(JSON.stringify(Test))
export default {
  name: 'App',
  components: {
    Test,
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.logo {
  border-radius: 50%;
}
</style>
