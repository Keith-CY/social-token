<template>
  <div id="page-index">
    <img class="logo-bg" src="~/assets/img/index/unipass-bg.svg" />
    <div class="account">
      <div class="left">
        <img class="avatar" src="~/assets/img/index/avatar.png" />
        <div class="mail">{{ user.account.email }}</div>
        <img
          class="qrcode"
          src="~/assets/img/index/qrcode.svg"
          @click="showQRCode = true"
        />
      </div>
      <div class="right"></div>
    </div>
    <div class="apps">
      <div class="app">
        <div class="icon" @click="bindRedPacket">
          <img src="~/assets/img/index/red-packet.svg" />
        </div>
        <span>{{ t_('RedPacket') }}</span>
      </div>
      <div class="app">
        <div class="icon" @click="bindTicket">
          <img src="~/assets/img/index/ticket.svg" />
        </div>
        <span>{{ t_('Ticket') }}</span>
      </div>
      <div class="app disabled">
        <div class="icon" @click="bindDisabled">
          <img src="~/assets/img/index/store.svg" />
        </div>
        <span>{{ t_('Store') }}</span>
      </div>
      <div class="app disabled">
        <div class="icon" @click="bindDisabled">
          <img src="~/assets/img/index/wallet.svg" />
        </div>
        <span>{{ t_('Wallet') }}</span>
      </div>
    </div>
    <div class="assets">
      <div class="title">{{ t_('NFTAssets') }}</div>
      <div v-loading="loading" class="nfts">
        <template v-if="nfts.length">
          <div v-for="(e, i) in nfts" :key="i" class="nft" @click="bindNFT(e)">
            <imgs class="image" :src="e.renderer" background />
            <div class="info">
              <div class="name">{{ e.name }}</div>
              <div class="info-bottom">
                <div class="author">{{ e.issuerName }}</div>
                <div class="have sea-colorful-border">
                  <template v-if="e.children && e.children.length">
                    ×{{ e.children.length }}
                  </template>
                  <template v-else>{{ t_('Claiming') }}</template>
                </div>
              </div>
            </div>
          </div>
          <infinite-loading @infinite="bindLoad"></infinite-loading>
        </template>
        <template v-else>
          <div class="no-assets">
            <img src="~/assets/img/index/no-assets.svg" />
            <div>{{ t_('NoAssets') }}</div>
          </div>
        </template>
      </div>
    </div>
    <el-dialog
      :title="t_('UniPassAddress')"
      center
      :visible.sync="showQRCode"
      width="100%"
      top="0"
      class="dialog-qrcode"
    >
      <img class="qrcode" :src="QRCode" alt="QRCode" />
      <div class="address" @click="bindAddressCopy">
        <span>{{ formatAddress }}</span>
        <i class="el-icon-copy-document"></i>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import QRCode from 'qrcode'
import { getAssets } from '~/assets/js/api-nft'
export default {
  name: 'Home',
  data() {
    return {
      inited: false,
      loading: false,
      asset: [],
      history: [],
      QRCode: '',
      showQRCode: false,
      scrollTop: 0,
      page: 0,
      limit: 20,
    }
  },
  computed: {
    formatAddress() {
      const start = this.address.slice(0, 9)
      const end = this.address.slice(-6)
      return `${start}...${end}`
    },
    user() {
      const user = this.$store.state.user
      if (user.address && this.inited === false) {
        this.initAssets()
        this.initQRCode()
      }
      return user
    },
    address() {
      const user = this.$store.state.user
      return user.address || ''
    },
    nfts() {
      return this.history.concat(this.asset)
    },
  },
  activated() {
    const top = this.scrollTop
    if (top > 0) {
      window.scrollTo(0, top)
      document.documentElement.scrollTop = top
      document.body.scrollTop = top
    }
  },
  deactivated() {
    const top = document.documentElement.scrollTop || document.body.scrollTop
    this.scrollTop = top
  },
  methods: {
    t_(key) {
      return this.$t('home.' + key)
    },
    bindAddressCopy() {
      this.$clipboard(this.address)
      this.$message.success(this.t_('CopySuccess'))
    },
    bindDisabled() {
      this.$message(this.t_('Disabled'))
    },
    bindRedPacket() {
      this.open(process.env.NFT_GIFT_HOST)
    },
    bindTicket() {
      this.open(process.env.NFT_TICKET_HOST)
    },
    open(host) {
      const user = this.$store.state.user
      const ret = {
        code: 200,
        info: 'login success',
        data: {
          email: user.account.email,
          pubkey: user.account.masterKey,
        },
      }
      const url = new URL(host)
      url.searchParams.set('unipass_ret', JSON.stringify(ret))
      window.location.href = url.href
    },
    bindNFT(nft) {
      this.$store.state.nft = nft
      this.$router.push('/nft')
    },
    async bindLoad($state) {
      this.page = this.page + 1
      const asset = await this.initAssets()
      const hasMore = asset.length === this.limit
      if (hasMore) {
        $state.loaded()
      } else {
        this.refreshAssets()
        $state.complete()
      }
    },
    async initAssets() {
      if (this.page === 0) {
        this.inited = true
        this.loading = true
      }
      const res = await getAssets({
        address: this.address,
        page: this.page,
        limit: this.limit,
      })
      if (this.page === 0) {
        this.loading = false
      }
      if (!res.ok) {
        this.$message.error('资产获取失败')
        return
      }
      const asset = []
      for (const nfts of res.data.asset) {
        const nft = this.Sea.deepCopy(nfts[0])
        nft.children = nfts
        asset.push(nft)
      }
      const history = res.data.history
      if (this.page === 0) {
        this.asset = asset
      } else {
        this.asset.push(...asset)
      }
      this.history = history
      return asset
    },
    async initQRCode() {
      // https://www.npmjs.com/package/qrcode#example-1
      const url = await QRCode.toDataURL(this.address, {
        type: 'image/png',
        width: 360,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
      this.QRCode = url
    },
    async refreshAssets() {
      const limit = (this.page + 1) * this.limit
      const res = await getAssets({
        address: this.address,
        page: 0,
        limit,
      })
      if (!res.ok) {
        console.log('refresh wrong')
        return
      }
      const asset = []
      for (const nfts of res.data.asset) {
        const nft = this.Sea.deepCopy(nfts[0])
        nft.children = nfts
        asset.push(nft)
      }
      const history = []
      for (const nft of res.data.history) {
        history.push(nft)
      }
      this.asset = asset
      this.history = history
    },
  },
  sockets: {
    connect() {
      // console.log('socket-connect')
    },
    newBlock() {
      // console.log('socket-newBlock')
      this.refreshAssets()
    },
    newTx() {
      // console.log('socket-newTx', data)
    },
    disconnect() {
      // console.log('socket-disconnect')
    },
    reconnect() {
      this.$socket.emit('connect')
    },
  },
}
</script>
<style lang="stylus">
#page-index {
  margin-top: -30px;
  position: relative;

  .dialog-qrcode {
    .el-dialog__body {
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;
      color: #000;

      .qrcode {
        width: 180px;
        height: 180px;
        background: #eee;
        border: 2px dashed #000;
      }

      .address {
        margin-top: 20px;
        font-weight: 500;

        i {
          margin-left: 4px;
        }
      }
    }
  }

  .logo-bg {
    position: absolute;
    top: -20px;
    right: -60px;
  }

  .account {
    width: 100%;
    display: flex;
    justify-content: space-between;

    .left {
      z-index: 1;
      display: flex;
      align-items: center;

      .avatar {
        user-select: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 1px solid #E9F0FF;
      }

      .mail {
        min-width: 120px;
        margin-left: 8px;
      }

      .qrcode {
        width: 16px;
        height: 16px;
        cursor: pointer;
        user-select: none;
        margin-left: 6px;
      }
    }
  }

  .apps {
    margin-top: 30px;
    display: flex;
    justify-content: space-between;
    width: 100%;
    z-index: 1;

    .app {
      display: flex;
      flex-direction: column;
      align-items: center;

      > .icon {
        cursor: pointer;
        user-select: none;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 74px;
        height: 74px;
        border-radius: 12px;
        box-shadow: 0px 2px 14px 4px rgba(55, 25, 255, 0.1);
      }

      > .icon:hover {
        box-shadow: 0px 0px 10px 0px rgba(55, 25, 255, 0.22);
      }

      > .icon:active {
        box-shadow: 0px 0px 10px 0px rgba(55, 25, 255, 0.32);
      }

      > span {
        margin-top: 6px;
        font-size: 12px;
      }
    }

    .app.disabled {
      > .icon {
        cursor: not-allowed;
        opacity: 0.6;
      }

      > span {
        color: #999;
      }
    }
  }

  .assets {
    margin-top: 30px;
    width: 100%;

    .title {
      font-size: 16px;
      font-weight: bold;
      line-height: 20px;
    }

    .nfts {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      margin-top: 13px;

      .nft {
        cursor: pointer;
        width: 48%;
        border-radius: 16px;
        overflow: hidden;
        background: white;
        padding: 12px;
        margin-bottom: 12px;
        display: flex;
        flex-direction: column;

        .image {
          background-color: #f6f7fb;
          border-radius: 16px;
        }

        .info {
          position: relative;

          .name {
            font-size: 16px;
            font-weight: bold;
            line-height: 20px;
            height: 40px;
            margin-top: 10px;
            word-break: break-all;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          .info-bottom {
            margin-top: 2px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;

            .author {
              font-size: 14px;
              line-height: 16px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }

            .have {
              flex-shrink: 0;
              padding: 0 5px;
              height: 24px;
              display: flex;
              justify-content: center;
              align-items: center;
              border-radius: 10px;
              font-size: 12px;
              color: var(--primary);
            }
          }
        }
      }

      .no-assets {
        font-size: 14px;
        color: #aaa;
        margin: 0 auto;
        text-align: center;

        > img {
          width: 200px;
          height: 200px;
        }
      }
    }
  }
}
</style>
