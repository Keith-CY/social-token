<template>
  <div id="page-asset">
    <nuxt-link :to="{ path: '/send', query: { name: 'CKB' } }">
      <el-button>发送</el-button>
    </nuxt-link>
  </div>
</template>
<script>
export default {}
</script>
<style lang="stylus">
#page-asset {
}
</style>
