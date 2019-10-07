<template>
  <div v-text="a"></div>
</template>
<script>
const Main = {
  mounted() {
    //this.$ps.post();
  },
  data() {
    return {
      a: "弹出窗口"
    };
  }
};
export default Main;
</script>
<style lang="less" scoped>
</style>