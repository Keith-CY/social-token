<template>
  <div id="page-asset">
    <nuxt-link :to="{ path: '/send', query: $route.query }">
      <el-button>发送</el-button>
    </nuxt-link>
    <el-radio-group v-model="direction" @change="bindDirection">
      <el-radio-button label="all">全部</el-radio-button>
      <el-radio-button label="in">收入</el-radio-button>
      <el-radio-button label="out">转出</el-radio-button>
    </el-radio-group>
    <div class="tx-list" v-loading="loading">
      <div v-for="(tx, i) in txList" :key="i">
        {{ tx.amount }}
      </div>
      <div v-if="hasMore" @click="bindMore">加载更多</div>
      <div v-else>~</div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      direction: 'all',
      txList: [],
      loading: false,
      hasMore: true,
      size: 10,
    }
  },
  created() {
    if (this.$route.query.name === 'CKB') {
      this.loadTxRecords()
    } else {
      this.$router.replace('/')
    }
  },
  methods: {
    async loadTxRecords(lastTxId) {
      this.loading = true
      const res = await this.$axios({
        url: 'https://cellapitest.ckb.pw/cell/txListV2',
        params: {
          lockHash:
            '0x470f26230dcc6df009ee66d45c7cbf3bb4791a52353cbce86ed5b488a73711e9',
          typeHash: '',
          lastTxId: lastTxId || '9999999999',
          size: this.size,
          direction: this.direction,
        },
      })
      this.loading = false
      if (res.code === 200) {
        if (lastTxId) {
          this.txList.push(...res.data)
        } else {
          this.txList = res.data
        }
        if (res.data.length < this.size) {
          this.hasMore = false
        } else {
          this.hasMore = true
        }
      } else {
        this.$message.error('请求失败')
      }
    },
    bindMore() {
      const last = this.txList.slice(-1)[0]
      if (last) {
        this.loadTxRecords(last.id)
      }
    },
    bindDirection() {
      this.txList = []
      this.loadTxRecords()
    },
  },
}
</script>
<style lang="stylus">
#page-asset {
  .tx-list {
    width: 100%;
    min-height: 200px;
  }
}
</style>
