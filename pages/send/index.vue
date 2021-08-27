<template>
  <div id="page-send">
    <el-form
      ref="form"
      :rules="rules"
      label-position="top"
      :model="form"
      class="form"
      @submit.native.prevent
    >
      <el-form-item :label="'收款地址'" prop="address">
        <el-input
          ref="address"
          v-model.trim="form.address"
          type="textarea"
          placeholder="地址格式: CKB / ETH / ENS"
          resize="none"
          :readonly="loading"
          autosize
          @keyup.enter="$refs.amount.focus()"
          @blur="bindBlur"
        ></el-input>
      </el-form-item>
      <div class="balance">{{ balance }} {{ asset.symbol }}</div>
      <el-form-item :label="'金额'" prop="amount">
        <el-input
          ref="amount"
          v-model.trim="form.amount"
          type="number"
          :readonly="loading"
          placeholder="0"
          @keyup.enter="bindSend"
          @blur="bindBlur"
        ></el-input>
      </el-form-item>
      <div v-loading="feeLoading" class="balance fee">{{ fee }} CKB</div>
      <el-form-item :label="'手续费'"></el-form-item>
    </el-form>
    <el-button
      type="primary"
      :loading="loading"
      :disabled="balance === ''"
      class="send"
      @click="bindSend"
    >
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
  Builder,
} from '@lay2/pw-core'
import {
  getUSDTSignMessage,
  getSUDTSignCallback,
} from '~/assets/js/sudt/sudt-tranfer'
import { getCkbEnv } from '~/assets/js/config'
import UnipassBuilder from '~/assets/js/UnipassBuilder.ts'
import UnipassBuilderClear from '~/assets/js/UnipassBuilderClear.ts'
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
        callback(new Error('错误的地址格式'))
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
      } else {
        try {
          const asset = this.asset
          const amount = new Amount(value, this.decimals)
          if (amount.gt(Amount.ZERO) && amount.gt(asset.sudtAmount)) {
            callback(new Error('转账金额必须小于余额'))
            return
          }
        } catch (error) {
          const message = error.message
          if (message.includes('is smaller than the digits number of')) {
            callback(new Error(`小数点后最多 ${this.decimals} 位`))
          } else if (message.includes('Cannot convert')) {
            callback(new Error(`请输入整数`))
          } else {
            callback(new Error(message))
          }
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
      feeLoading: false,
      loading: false,
      form: {
        address:
          'ckt1qsfy5cxd0x0pl09xvsvkmert8alsajm38qfnmjh2fzfu2804kq47d2pxgpmm7c0ds5emzj7nc4e9zdgwzuw65stdl58',
        amount: '',
      },
      fee: name === 'CKB' ? '0.00001551' : '0.00002040',
      feeRate: 1000,
      name,
      // 发送全部 CKB
      clearCKB: false,
      nowTx: null,
      oldAmount: '',
      oldAddress: '',
    }
  },
  computed: {
    provider() {
      return this.$store.state.provider
    },
    asset() {
      const assets = this.$store.state.assets
      for (const asset of assets) {
        if (asset.symbol === this.name) {
          return asset
        }
      }
      return {}
    },
    decimals() {
      return this.asset.decimals || AmountUnit.shannon
    },
    balance() {
      const asset = this.asset
      if (asset.symbol) {
        const balance = asset.sudt ? asset.sudtAmount : asset.capacity
        return balance.toString(this.decimals, {
          commify: true,
          fixed: this.decimals >= 4 ? 4 : this.decimals || undefined,
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
      if (this.asset && this.asset.typeScript) {
        return this.asset.typeScript.args
      }
      return ''
    },
  },
  created() {
    const name = this.name
    if (!name) {
      this.$router.replace('/')
    }
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
        } else {
          this.sendSTNext(ret.data.sig)
        }
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
    async bindBlur() {
      const address = this.form.address
      let amount = this.form.amount
      if (amount && amount.includes('.')) {
        const dot = amount.split('.')
        if (dot[1].length > this.decimals) {
          amount = String(Number(amount).toFixed(this.decimals))
          this.form.amount = amount
        }
      }
      if (address && amount) {
        if (this.oldAmount === amount && this.oldAddress === address) {
          return
        } else {
          this.oldAmount = amount
          this.oldAddress = address
        }
        this.feeLoading = true
        try {
          if (this.name === 'CKB') {
            await this.buildCKB()
          } else {
            await this.buildST()
          }
        } catch (error) {}
        this.feeLoading = false
      }
    },
    async buildST() {
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
      // build
      if (address && amount && this.sudtTokenId) {
        const { tx, txObj, message } = await getUSDTSignMessage(
          this.sudtTokenId,
          new Address(address, AddressType.ckb),
          new Amount(amount, this.decimals),
          provider.pubkey,
        )
        const fee = Builder.calcFee(tx, this.feeRate)
        this.fee = fee.toString(8, AmountUnit.shannon)
        return { txObj, message }
      }
    },
    async buildCKB() {
      const { address, amount } = this.form
      let builder
      if (this.clearCKB) {
        builder = new UnipassBuilderClear(
          new Address(address, AddressType.ckb),
          this.feeRate,
        )
      } else {
        builder = new UnipassBuilder(
          new Address(address, AddressType.ckb),
          new Amount(amount),
          this.feeRate,
        )
      }
      const tx = await builder.build()
      const fee = Builder.calcFee(tx, this.feeRate)
      this.fee = fee.toString(8, AmountUnit.shannon)
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
    send() {
      if (this.name === 'CKB') {
        this.sendCKB()
      } else {
        this.sendST()
      }
    },
    async sendST() {
      const provider = this.provider
      const { address, amount } = this.form
      // send
      try {
        const data = await this.buildST()
        if (data) {
          const { message, txObj } = data
          this.Sea.localStorage('signData', {
            txObj,
            pending: {
              from: provider.address,
              to: address,
              amount: new Amount(amount, this.decimals).toHexString(),
            },
          })
          this.sign(message, provider.pubkey)
        }
      } catch (error) {
        this.loading = false
        const message = error.message
        console.error(message)
        this.$message.error(message)
      }
    },
    async sendCKB() {
      try {
        const { address, amount } = this.form
        const tx = await this.buildCKB(address, amount)
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
        const message = error.message
        if (message.includes('input capacity not enough')) {
          this.$confirm(
            '剩余金额过低，无法发送交易。是否要发送全部的 CKB？',
            '注意',
            {
              confirmButtonText: '发送全部 CKB',
              cancelButtonText: '取消',
            },
          )
            .then(() => {
              this.clearCKB = true
              const asset = this.asset
              this.form.amount = asset.capacity.toString(
                this.decimals,
                AmountUnit.shannon,
              )
              this.sendCKB()
            })
            .catch(() => {
              this.loading = false
            })
        } else {
          this.loading = false
          this.$message.error(message)
          console.error('error', message)
        }
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
        let witness
        if (this.clearCKB) {
          witness = new Reader(
            SerializeWitnessArgs(
              normalizers.NormalizeWitnessArgs({
                lock: '0x00' + sig.replace('0x', ''),
                input_type: '',
                output_type: '',
              }),
            ),
          ).serializeJson()
        } else {
          witness = new Reader(
            SerializeWitnessArgs(
              normalizers.NormalizeWitnessArgs({
                lock: '0x01' + sig.replace('0x', ''),
                input_type: '',
                output_type: '',
              }),
            ),
          ).serializeJson()
        }
        const { txObj, pending } = this.Sea.localStorage('signData')
        txObj.witnesses[0] = witness
        const url = getCkbEnv()
        const rpc = new RPC(url.NODE_URL)
        const txHash = await rpc.send_transaction(txObj)
        if (txHash) {
          this.$message.success('发送成功')
          this.pendingList(txHash, pending)
        } else {
          this.$message.error('交易失败')
        }
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
        const { txObj, pending } = this.Sea.localStorage('signData')
        const txHash = await getSUDTSignCallback(sig, txObj)
        if (txHash) {
          this.$message.success('发送成功')
          this.pendingList(txHash, pending)
        } else {
          this.$message.error('交易失败')
        }
      } catch (error) {
        this.$message.error(error.message)
        console.error('error', error.message)
      }
      this.Sea.params('unipass_ret', '')
      this.loading = false
    },
    pendingList(txHash, pending) {
      const pendingList = this.Sea.localStorage('pendingList') || []
      pendingList.push({
        hash: txHash,
        time: Date.now(),
        from: pending.from,
        to: pending.to,
        type: 'pending',
        amount: pending.amount,
        direction: 'out',
        name: this.name,
      })
      this.Sea.localStorage('pendingList', pendingList)
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
