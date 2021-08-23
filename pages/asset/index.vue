<template>
  <div id="page-asset">
    <div class="info-card">
      <img class="bg" src="~/assets/img/home/info-card-blur.svg" />
      <div class="top">
        <div class="left">
          <img class="icon" :src="asset.icon" />
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
        <div class="btn right" @click="bindSend">
          <span>转账</span>
          <img src="~/assets/img/asset/send.svg" />
        </div>
      </div>
    </div>
    <el-tabs v-model="activeTab" class="tabs" @tab-click="bindTab">
      <el-tab-pane class="token" label="代币详情" name="token">
        <div class="user">
          <img class="avatar" src="~/assets/img/home/avatar.png" />
          <div class="name">Andy Warhol</div>
          <div class="publisher sea-colorful-border">发行人</div>
        </div>
        <div class="introduction">
          Helen Kennedy aka ZazzCorp an artist illustrator with an obsession for
          drawing skulls. The Zazz Corp motto Design for Weirdos" embodies the
          strange, far out, and weird.
        </div>
        <div class="token-info">
          <div class="info">
            <div class="left">代币总量：</div>
            <div class="right">45,100,000.1234</div>
          </div>
          <div class="info">
            <div class="left">流通量：</div>
            <div class="right">100,000.1234</div>
          </div>
          <div class="info">
            <div class="left">发行日期：</div>
            <div class="right">2021-8-17</div>
          </div>
          <div class="info">
            <div class="left">社交方式：</div>
            <div class="right">
              <a href="http://unipass.xyz" target="_blank">
                <img class="icon" src="~/assets/img/asset/github.svg" />
              </a>
              <a href="http://unipass.xyz" target="_blank">
                <img class="icon" src="~/assets/img/asset/facebook.svg" />
              </a>
              <a href="http://unipass.xyz" target="_blank">
                <img class="icon" src="~/assets/img/asset/twitter.svg" />
              </a>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane class="record" label="交易记录" name="record">
        <el-radio-group v-model="direction" @change="bindDirection">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="in">收入</el-radio-button>
          <el-radio-button label="out">转出</el-radio-button>
        </el-radio-group>
        <div class="tx-list">
          <div
            v-for="(tx, i) in formatTxList"
            :key="i"
            class="tx"
            :class="[formatState(tx), tx.type]"
          >
            <imgs
              class="state"
              :src="require(`~/assets/img/asset/${formatState(tx)}.svg`)"
            />
            <div class="info">
              <div class="address">
                {{ formatAddress(tx.from) }}
              </div>
              <div class="time">{{ formatDate(tx.time) }}</div>
            </div>
            <div class="balance">{{ formatBalance(tx) }}</div>
          </div>
          <div v-loading="loading" class="more">
            <div v-if="hasMore" class="load" @click="bindMore">加载更多</div>
            <div v-else class="end">~</div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { Amount, AmountUnit } from '@lay2/pw-core'
dayjs.locale('zh-cn')
export default {
  data() {
    return {
      direction: 'all',
      txList: [],
      pendingList: [],
      loading: false,
      hasMore: true,
      size: 10,
      activeTab: 'record',
    }
  },
  computed: {
    formatTxList() {
      if (this.direction === 'in') {
        return this.txList
      } else {
        const all = this.pendingList.concat(this.txList)
        return all
      }
    },
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
  mounted() {
    this.initPending()
  },
  methods: {
    initPending() {
      const pendingList = this.Sea.localStorage('pendingList')
      if (pendingList) {
        this.pendingList = pendingList
      }
    },
    formatDate(time) {
      return dayjs(time).format('YYYY/M/D Ah:m')
    },
    formatBalance(tx) {
      const asset = this.asset
      const balance = new Amount(tx.amount, AmountUnit.shannon)
      const string = balance.toString(asset.decimals, {
        commify: true,
        fixed: 4,
      })
      const op = tx.direction === 'out' ? '-' : '+'
      return op + string
    },
    formatState(tx) {
      return tx.direction
    },
    formatAddress(address) {
      const start = address.slice(0, 8)
      const end = address.slice(-8)
      return `${start}...${end}`
    },
    bindSend() {
      this.$router.push({
        path: '/send',
        query: this.$route.query,
      })
    },
    bindTab() {},
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
      position: absolute;
      bottom: 18px;
      left: 12px;
      right: 12px;
      display: flex;
      justify-content: space-around;
      color: #3179FF;

      .btn {
        cursor: pointer;
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

  .tabs {
    margin-top: 21px;
    border-radius: 14px;
    width: 100%;
    background: white;
    margin-bottom: 20px;

    .el-tabs__header {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;

      .el-tabs__item {
        height: 52px;
        line-height: 52px;
        font-size: 16px;
        font-weight: 600;
        color: #999999;
      }

      .el-tabs__item.is-active {
        color: #333333;
      }

      .el-tabs__active-bar {
        width: 36px !important;
        height: 4px;
        margin: 0 14px;
        background: linear-gradient(320deg, #1C7BFF 0%, #9D6FFF 100%);
        border-radius: 2px;
      }

      .el-tabs__nav-wrap::after {
        background-color: transparent;
      }
    }

    .el-tab-pane {
      width: 100%;
      padding: 0 20px;

      .el-radio-group {
        height: 32px;
        border-radius: 16px;
        border: 1px solid #E9F0FF;
        overflow: hidden;
        display: flex;
        justify-content: space-between;

        .el-radio-button {
          flex: 1;

          .el-radio-button__inner {
            width: 100%;
            border: 0;
            box-shadow: none;
            padding: 0;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: none;
          }
        }

        .el-radio-button.is-active {
          .el-radio-button__inner {
            border-radius: 16px;
            background: linear-gradient(320deg, #1C7BFF 0%, #9D6FFF 100%);
          }
        }
      }
    }

    .token {
      .user {
        display: flex;
        align-items: center;

        .avatar {
          width: 36px;
          border-radius: 50%;
          height: 36px;
          border: 1px solid #E9F0FF;
        }

        .name {
          font-size: 14px;
          font-weight: bold;
          color: #333333;
          margin-left: 8px;
        }

        .publisher {
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: auto;
          width: 58px;
          height: 26px;
          border-radius: 14px;
          font-size: 12px;
          color: #3179FF;
        }
      }

      .introduction {
        margin-top: 16px;
        font-size: 14px;
        font-family: SFProText-Regular, SFProText;
        font-weight: 400;
        color: #666666;
        line-height: 22px;
        margin-bottom: 16px;
      }

      .token-info {
        margin-bottom: 20px;

        .info {
          margin-top: 20px;
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          font-weight: bold;
          color: #333333;
          line-height: 20px;

          .right {
            display: flex;

            .icon {
              margin-left: 12px;
              width: 20px;
              height: 20px;
            }
          }
        }
      }
    }

    .record {
      .tx-list {
        margin-top: 20px;
        width: 100%;
        min-height: 200px;

        .tx {
          margin-top: 10px;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: center;

          .state {
            width: 20px;
            height: 20px;
          }

          .info {
            margin-left: 4px;

            .address {
              font-size: 14px;
              font-weight: bold;
              color: #333333;
              line-height: 20px;
            }

            .time {
              margin-top: 4px;
              color: #B8B8B8;
              font-size: 12px;
              line-height: 14px;
            }
          }

          .balance {
            font-size: 14px;
            font-weight: bold;
            margin-left: auto;
          }
        }

        .tx.pending {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .tx.in {
          .balance {
            color: var(--primary);
          }
        }

        .tx.out {
          .balance {
            color: #FFA71A;
          }
        }

        .more {
          text-align: center;
          margin: 10px 0;

          .load {
            cursor: pointer;
            cursor: pointer;
            font-size: 14px;
            color: #333;
          }
        }
      }
    }
  }
}
</style>
