<template>
  <div id="page-asset">
    <div class="info-card">
      <img class="bg" src="~/assets/img/index/info-card-blur.svg" />
      <div class="top">
        <div class="left">
          <imgs class="icon" :src="asset.icon" />
          <div class="info">
            <div class="symbol">{{ asset.symbol }}</div>
            <div class="name">{{ asset.name }}</div>
          </div>
        </div>
        <div class="right">{{ balance }}</div>
      </div>
      <div class="bottom">
        <div class="btn left">
          <span>收款</span>
          <img src="~/assets/img/asset/qrcode.svg" />
        </div>
        <div class="btn right">
          <span>转账</span>
          <img src="~/assets/img/asset/send.svg" />
        </div>
      </div>
    </div>
    <nuxt-link :to="{ path: '/send', query: $route.query }">
      <el-button>发送</el-button>
    </nuxt-link>
    <el-radio-group v-model="direction" @change="bindDirection">
      <el-radio-button label="all">全部</el-radio-button>
      <el-radio-button label="in">收入</el-radio-button>
      <el-radio-button label="out">转出</el-radio-button>
    </el-radio-group>
    <div v-loading="loading" class="tx-list">
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
  computed: {
    asset() {
      const assets = this.$store.state.assets
      const name = this.$route.query.name
      for (const asset of assets) {
        if (asset.symbol === name) {
          return asset
        }
      }
      return {}
    },
    balance() {
      const asset = this.asset
      if (asset.decimals) {
        const balance = asset.sudt ? asset.sudtAmount : asset.capacity
        return balance.toString(asset.decimals, {
          commify: true,
          fixed: 4,
        })
      }
      return ''
    },
  },
  created() {
    const name = this.$route.query.name
    if (name) {
      if (name === 'CKB') {
        this.loadTxRecords()
      } else {
        this.$alert(`提示：暂不支持 ${name} 币`, {
          confirmButtonText: '返回上一页',
          callback: () => {
            this.$router.back()
          },
        })
      }
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
  .info-card {
    margin-top: 30px;
    display: flex;
    width: 100%;
    min-height: 168px;
    position: relative;
    color: white;

    .bg {
      width: 100%;
    }

    .top {
      position: absolute;
      top: 30px;
      left: 14px;
      right: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .left {
        display: flex;
        align-items: center;

        .icon {
          width: 42px;
          height: 42px;
          padding: 9px;
          background: white;
          border-radius: 10px;
          border: 1px solid #E9F0FF;
        }

        .info {
          font-size: 14px;
          margin-left: 8px;

          .name {
            margin-top: 4px;
          }
        }
      }

      .right {
      }
    }

    .bottom {
      cursor: pointer;
      position: absolute;
      bottom: 18px;
      left: 12px;
      right: 12px;
      display: flex;
      justify-content: space-between;
      color: #3179FF;

      .btn {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 142px;
        height: 38px;
        background: #FFFFFF;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        color: #3179FF;
        line-height: 20px;

        img {
          margin-left: 5px;
        }
      }
    }
  }

  .tx-list {
    width: 100%;
    min-height: 200px;
  }
}
</style>
