import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

Vue.prototype.$track = (event, data) => {
  console.log(event);
  console.log(data);
  console.log("执行埋点方法...");
}

new Vue({
  render: h => h(App),
}).$mount('#app')

mainTest();

function mainTest() {
  console.log('mainTest')
}

const obj = {
  objTest() {
    console.log('objtest')
  }
}
obj.objTest();