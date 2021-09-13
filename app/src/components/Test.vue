<template>
  <div class="btn" @click="onItemClick_track(1, 2)">{{ text }}</div>
</template>
<script>
import text from "../assets/text.haha";
export default {
  data() {
    return {
      text,
    };
  },
  methods: {
    onItemClick_track(p1, p2) {
      console.log(`进入onItemClick，参数：${p1}, ${p2}`);
    },
  },
};
</script>
<style >
.btn {
  cursor: pointer;
}
</style>
