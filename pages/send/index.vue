<template>
  <div id="page-send">
    <div v-if="asset">{{ balance }} {{ asset.symbol }}</div>
    <el-input
      v-model="address"
      type="textarea"
      placeholder="address"
      resize="none"
      :readonly="loading"
      autosize
    ></el-input>
    <el-input
      v-model="amount"
      :readonly="loading"
      placeholder="amount"
    ></el-input>
    <el-button type="primary" :loading="loading" @click="bindSend">
      发送
    </el-button>
  </div>
</template>
<script>
import PWCore, {
  RPC,
  Reader,
  Address,
  AddressType,
  Amount,
  normalizers,
  SerializeWitnessArgs,
  transformers,
} from '@lay2/pw-core'
import { getCkbEnv } from '~/assets/js/config'
import UnipassBuilder from '~/assets/js/UnipassBuilder.ts'
import UnipassSigner from '~/assets/js/UnipassSigner.ts'
export default {
  data() {
    return {
      loading: false,
      address:
        'ckt1qsfy5cxd0x0pl09xvsvkmert8alsajm38qfnmjh2fzfu2804kq47v656967xywaf26kphp033cn2tl6qn852gc7jzch',
      amount: '100',
    }
  },
  computed: {
    provider() {
      return this.$store.state.provider
    },
    asset() {
      const assets = this.$store.state.assets
      const name = this.$route.query.name
      for (const asset of assets) {
        if (asset.symbol === name) {
          return asset
        }
      }
      return null
    },
    balance() {
      const asset = this.asset
      if (asset) {
        const balance = asset.sudt ? asset.sudtAmount : asset.capacity
        return balance.toString(asset.decimals, {
          commify: true,
          fixed: 4,
        })
      }
      return ''
    },
  },
  mounted() {
    const ret = this.Sea.json(this.$route.query.unipass_ret)
    if (ret && ret.info === 'sign success') {
      this.sendNext(ret.data.sig)
    }
  },
  methods: {
    async bindSend() {
      try {
        const toAddress = this.address
        const toAmount = this.amount
        const builder = new UnipassBuilder(
          new Address(toAddress, AddressType.ckb),
          new Amount(toAmount),
        )
        const signer = new UnipassSigner(PWCore.provider)
        this.loading = true
        const tx = await builder.build()
        const messages = signer.toMessages(tx)
        const message = messages[0].message
        const pubkey = this.provider.pubkey
        const txObj = transformers.TransformTransaction(tx)
        this.Sea.localStorage('signData', { txObj })
        this.sign(message, pubkey)
      } catch (error) {
        this.$message.error('交易拼接失败')
        console.error('error', error)
      }
      this.loading = false

      // 备注
      // 0 get_cells 获取 ckb 数量
      // 1 get_cells 检查是否可以发送
      // 2 send_transaction 发送
    },
    sign(message, pubkey) {
      const url = new URL(`${process.env.UNIPASS_URL}/sign`)
      url.searchParams.set('success_url', window.location.href)
      url.searchParams.set('message', message)
      url.searchParams.set('pubkey', pubkey)
      window.location.replace(url.href)
    },
    async sendNext(sig) {
      try {
        this.loading = true
        const witness = new Reader(
          SerializeWitnessArgs(
            normalizers.NormalizeWitnessArgs({
              lock: '0x01' + sig.replace('0x', ''),
              input_type: '',
              output_type: '',
            }),
          ),
        ).serializeJson()
        const { txObj } = this.Sea.localStorage('signData')
        txObj.witnesses[0] = witness
        const url = getCkbEnv()
        const rpc = new RPC(url.NODE_URL)
        const txHash = await rpc.send_transaction(txObj)
        console.log(`https://explorer.nervos.org/aggron/transaction/${txHash}`)
        this.$message.success('发送成功')
      } catch (error) {
        this.$message.error(error)
        console.error('error', error)
      }
      this.Sea.params('unipass_ret', '')
      this.loading = false
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
