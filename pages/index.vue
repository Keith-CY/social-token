<template>
  <div id="page-index">
    <nuxt-link :to="{ path: '/asset', query: { name: 'CKB' } }">
      <el-button>CKB</el-button>
    </nuxt-link>
  </div>
</template>
<script>
export default {}
</script>
<style lang="stylus">
#page-index {
}
</style>
