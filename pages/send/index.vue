<template>
  <div id="page-asset">
    <el-input v-model="address" placeholder="address"></el-input>
    <el-input v-model="amount" placeholder="amount"></el-input>
    <el-button type="primary" @click="bindSend">发送</el-button>
  </div>
</template>
<script>
export default {
  data() {
    return {
      address: '',
      amount: '',
    }
  },
  methods: {
    bindSend() {
      console.log('🌊', 213123)
    },
  },
}
</script>
<style lang="stylus">
#page-asset {
  .el-input, .el-button {
    width: 100%;
    margin-top: 20px;
  }
}
</style>
