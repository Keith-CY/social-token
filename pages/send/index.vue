<template>
  <div id="page-send">
    <el-form
      ref="form"
      :rules="rules"
      label-position="top"
      :model="form"
      class="form"
    >
      <el-form-item :label="'收款地址'" prop="address">
        <el-input
          v-model.trim="form.address"
          type="textarea"
          placeholder="地址格式: CKB / ETH / ENS"
          resize="none"
          :readonly="loading"
          autosize
        ></el-input>
      </el-form-item>
      <div class="balance">{{ balance }} {{ asset.symbol }}</div>
      <el-form-item :label="'金额'" prop="amount">
        <el-input
          v-model.trim="form.amount"
          type="number"
          :disabled="balance === ''"
          :readonly="loading"
          placeholder="0"
        ></el-input>
      </el-form-item>
      <div class="balance fee">{{ fee }} CKB</div>
      <el-form-item :label="'手续费'"></el-form-item>
    </el-form>
    <el-button type="primary" :loading="loading" class="send" @click="bindSend">
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
  AmountUnit,
} from '@lay2/pw-core'
import {
  getUSDTSignMessage,
  getSUDTSignCallback,
} from '~/assets/js/sudt/sudt-tranfer'
import { getCkbEnv } from '~/assets/js/config'
import UnipassBuilder from '~/assets/js/UnipassBuilder.ts'
import UnipassSigner from '~/assets/js/UnipassSigner.ts'
export default {
  data() {
    const name = this.$route.query.name
    const checkAddress = (_rule, value, callback) => {
      try {
        if (value.startsWith('ckb') || value.startsWith('ckt')) {
          // eslint-disable-next-line no-new
          new Address(value, AddressType.ckb)
          callback()
        } else if (/^0x[a-fA-F0-9]{40}$/.test(value)) {
          // eslint-disable-next-line no-new
          new Address(value, AddressType.eth)
          callback()
        } else {
          callback(new Error('错误的地址格式'))
        }
      } catch (error) {
        callback(error)
      }
    }
    const checkAmount = (_rule, value, callback) => {
      if (name === 'CKB') {
        try {
          const amount = new Amount(value)
          if (amount.lt(new Amount('61'))) {
            callback(new Error('最小金额为 61 CKB'))
            return
          }
          const asset = this.asset
          if (amount.gt(Amount.ZERO) && amount.gt(asset.capacity)) {
            callback(new Error('转账金额必须小于余额'))
            return
          }
        } catch (error) {
          callback(new Error(error.message))
          return
        }
      } else if (name === 'ST') {
        try {
          const amount = new Amount(value, AmountUnit.shannon)
          const asset = this.asset
          if (amount.gt(Amount.ZERO) && amount.gt(asset.sudtAmount)) {
            callback(new Error('转账金额必须小于余额'))
            return
          }
        } catch (error) {
          callback(new Error(error.message))
          return
        }
      }
      callback()
    }
    return {
      rules: {
        address: [
          { required: true, message: '请填写收款地址', trigger: 'change' },
          { validator: checkAddress, trigger: 'change' },
        ],
        amount: [
          { required: true, message: '请填写金额', trigger: 'change' },
          { validator: checkAmount, trigger: 'change' },
        ],
      },
      loading: false,
      form: {
        address:
          'ckt1qsfy5cxd0x0pl09xvsvkmert8alsajm38qfnmjh2fzfu2804kq47d2pxgpmm7c0ds5emzj7nc4e9zdgwzuw65stdl58',
        amount: '',
      },
      fee: '0.00001551',
      name,
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
      return {}
    },
    balance() {
      const asset = this.asset
      if (asset.decimals !== undefined) {
        const balance = asset.sudt ? asset.sudtAmount : asset.capacity
        return balance.toString(asset.decimals, {
          commify: true,
          fixed: 4,
        })
      }
      return ''
    },
    typeHash() {
      if (this.name === 'CKB') {
        return ''
      } else {
        return this.asset.typeHash
      }
    },
    sudtTokenId() {
      return this.asset.typeScript.args
    },
  },
  mounted() {
    if (this.balance) {
      this.loading = false
    }
    const ret = this.Sea.json(this.$route.query.unipass_ret)
    if (ret) {
      if (ret.info === 'sign success') {
        const name = this.name
        if (name === 'CKB') {
          this.sendCKBNext(ret.data.sig)
        } else if (name === 'ST') {
          this.sendSTNext(ret.data.sig)
        } else {
          this.$message.error('未知资产')
        }
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
    async buildTx(address, amount) {
      const builder = new UnipassBuilder(
        new Address(address, AddressType.ckb),
        new Amount(amount),
        1000,
      )
      const tx = await builder.build()
      return tx
    },
    bindSend() {
      this.loading = true
      this.$refs.form.validate((ok) => {
        if (ok) {
          this.send()
        } else {
          this.loading = false
        }
      })
    },
    async sendST() {
      // check
      const provider = this.provider
      const { address, amount } = this.form
      if (address === provider.address) {
        this.$message.error('收款地址不能为自己')
        this.loading = false
        return
      }
      const lockHash = new Address(address, AddressType.ckb)
        .toLockScript()
        .toHash()
      const res = await this.$axios({
        url: '/cell/unSpent',
        params: {
          lockHash,
          typeHash: this.typeHash,
          capacity: new Amount('1', AmountUnit.shannon).toHexString(),
        },
      })
      if (res.data.length === 0) {
        this.$message.error('对方地址没有能接收的 SUDT，暂时无法转账')
        this.loading = false
        return
      }
      // send
      try {
        const { message, txObj } = await getUSDTSignMessage(
          this.sudtTokenId,
          address,
          amount,
          provider.pubkey,
        )
        this.Sea.localStorage('signData', { txObj, message })
        this.sign(message, provider.pubkey)
      } catch (error) {
        this.loading = false
        console.error(error.message)
        this.$message.error(error.message)
      }
    },
    send() {
      if (this.name === 'ST') {
        this.sendST()
      } else if (this.name === 'CKB') {
        this.sendCKB()
      }
    },
    async sendCKB() {
      try {
        const { address, amount } = this.form
        const tx = await this.buildTx(address, amount)
        const signer = new UnipassSigner(PWCore.provider)
        const messages = signer.toMessages(tx)
        const message = messages[0].message
        const pubkey = this.provider.pubkey
        const txObj = transformers.TransformTransaction(tx)
        this.Sea.localStorage('signData', {
          txObj,
          pending: {
            from: this.provider.address,
            to: address,
            amount: new Amount(amount).toHexString(),
          },
        })
        this.sign(message, pubkey)
      } catch (error) {
        this.$message.error(error.message)
        console.error('error', error.message)
        this.loading = false
      }
    },
    sign(message, pubkey) {
      const url = new URL(`${process.env.UNIPASS_URL}/sign`)
      url.searchParams.set('success_url', window.location.href)
      url.searchParams.set('message', message)
      url.searchParams.set('pubkey', pubkey)
      window.location.replace(url.href)
    },
    async sendCKBNext(sig) {
      this.loading = true
      try {
        const witness = new Reader(
          SerializeWitnessArgs(
            normalizers.NormalizeWitnessArgs({
              lock: '0x01' + sig.replace('0x', ''),
              input_type: '',
              output_type: '',
            }),
          ),
        ).serializeJson()
        const { txObj, pending } = this.Sea.localStorage('signData')
        txObj.witnesses[0] = witness
        const url = getCkbEnv()
        const rpc = new RPC(url.NODE_URL)
        const txHash = await rpc.send_transaction(txObj)
        this.$message.success('发送成功')
        const pendingListCKB = this.Sea.localStorage('pendingListCKB') || []
        pendingListCKB.push({
          hash: txHash,
          time: Date.now(),
          token: 'CKB',
          from: pending.from,
          to: pending.to,
          type: 'pending',
          amount: pending.amount,
          fee: 1551,
          direction: 'out',
        })
        this.Sea.localStorage('pendingListCKB', pendingListCKB)
      } catch (error) {
        this.$message.error(error.message)
        console.error('error', error.message)
      }
      this.Sea.params('unipass_ret', '')
      this.loading = false
    },
    async sendSTNext(sig) {
      try {
        this.loading = true
        const { txObj } = this.Sea.localStorage('signData')
        const txhash = await getSUDTSignCallback(sig, txObj)
        this.$message.success('发送成功')
        console.log('txhash', txhash)
        // pending list
        // const pendingListST = this.Sea.localStorage('pendingListST') || []
        // pendingListST.push({
        //   // id: 8742876,
        //   hash: txHash,
        //   time: Date.now(),
        //   token: 'CKB',
        //   from: pending.from,
        //   to: pending.to,
        //   type: 'pending',
        //   amount: pending.amount,
        //   fee: 1551,
        //   direction: 'out',
        //   // blockNumber: 2538481,
        //   // inputSize: 1,
        //   // outputSize: 2,
        //   // remark: '',
        // })
        // this.Sea.localStorage('pendingListST', pendingListST)
      } catch (error) {
        this.$message.error(error.message)
        console.error('error', error.message)
      }
      this.Sea.params('unipass_ret', '')
      this.loading = false
    },
  },
}
</script>
<style lang="stylus">
#page-send {
  .form {
    margin-top: 30px;

    .balance {
      display: flex;
      justify-content: flex-end;
      font-size: 14px;
      font-weight: 600;
      color: #3179FF;
      line-height: 20px;
      margin-top: 70px;
      margin-bottom: -21px;
    }

    .balance.fee {
      color: var(--text-regular);
      margin-top: 40px;
    }
  }

  .send {
    margin-top: 110px;
    margin-bottom: 40px;
    width: 100%;
  }
}
</style>
