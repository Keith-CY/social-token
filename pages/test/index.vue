<template>
  <div id="page-send">
    totalToken {{ totalToken }}
    <el-input v-model="toAddress" placeholder="toAddress"></el-input>
    <el-input v-model="sudtTokenId" placeholder="sudt"></el-input>
    <el-input v-model="amount" placeholder="amount"></el-input>
    <el-button type="primary" :loading="loading" @click="transfer">
      发送
    </el-button>
    {{ txhash }}
  </div>
</template>
<script>
import {
  getUSDTSignMessage,
  getSUDTSignCallback,
} from '~/assets/js/sudt/sudt-tranfer'
import {
  generateUnipassUrl,
  saveState,
  restoreState,
} from '~/assets/js/url/state-data'
import { ActionType } from '~/assets/js/url/interface'

export default {
  data() {
    return {
      loading: false,
      totalToken: 0,
      toAddress:
        'ckt1qsfy5cxd0x0pl09xvsvkmert8alsajm38qfnmjh2fzfu2804kq47dusc6l0nlyv80d3dn78qtd8e4kryxgtj5e7mdh6',
      amount: '10',
      sudtTokenId:
        '0x9ec9ae72e4579980e41554100f1219ff97599f8ab7e79c074b30f2fa241a790c',
      txhash: '',
    }
  },
  mounted() {
    const ret = this.Sea.json(this.$route.query.unipass_ret)
    if (ret) {
      if (ret.info === 'sign success') {
        this.sendNext(ret.data.sig)
      } else if (ret.info === 'sign fail') {
        this.$message.error('拒绝签名')
      } else if (ret.info === 'sign fail') {
        this.$message.error('拒绝签名')
      } else if (ret.info === 'pubkey not match') {
        this.$message.error('公钥不匹配')
      } else {
        this.Sea.params('unipass_ret', '')
      }
    }
  },
  methods: {
    async transfer() {
      // this.loading = true
      const provider = this.$store.state.provider
      const pubkey = provider.pubkey
      console.log('toAddress', this.toAddress)
      console.log('amount', this.amount)
      console.log('sudt', this.sudtTokenId)
      console.log('pubkey', pubkey)

      if (!this.sudtTokenId || !this.toAddress || !this.amount || !pubkey) {
        this.loading = false
        return
      }

      const { message, data } = await getUSDTSignMessage(
        this.sudtTokenId,
        this.toAddress,
        this.amount,
        pubkey,
      )
      console.log(message)
      const host = process.env.UNIPASS_URL
      const successUrl = new URL(window.location.href).href
      const _url = generateUnipassUrl(host, 'sign', {
        success_url: successUrl,
        pubkey,
        message,
      })
      saveState(ActionType.SignMsg, data)
      console.log(_url)
      window.location.href = _url
      this.loading = false
    },

    async sendNext(sig) {
      this.loading = true
      const pageState = restoreState()
      const extraObj = pageState.extraObj
      if (!sig && !extraObj) {
        this.loading = false
        return
      }
      console.log('[[[[extraObj]]]]', pageState)
      const txhash = await getSUDTSignCallback(sig, extraObj)
      console.log('txhash', txhash)
      this.loading = false
      this.txhash = txhash
    },

    getMinesUdtToken() {
      this.totalToken = 100
    },
  },
}
</script>
<style lang="stylus">
#page-send {
  .el-input, .el-button, .el-textarea {
    width: 100%;
    margin-top: 20px;
  }
}
</style>
