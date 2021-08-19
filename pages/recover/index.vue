<template>
  <div id="page-recover" :class="`step${step}`">
    <template v-if="showSteps">
      <div class="sea-title">{{ step }} {{ t_('step' + step) }}</div>
      <div class="steps">
        <template v-for="(e, i) in steps">
          <div :key="i" class="step" :class="{ active: step === e.id }">
            <div v-if="e.id < step" class="box right">
              <img src="~/assets/img/right.svg" />
            </div>
            <div v-else class="box">{{ e.id }}</div>
            <div class="name">{{ t_('step' + e.id) }}</div>
            <div
              v-if="i + 1 !== steps.length"
              class="line"
              :class="{ right: e.id < step }"
            ></div>
          </div>
        </template>
      </div>
    </template>
    <template v-if="step === 0">
      <img src="~/assets/img/unipass-lock-forget.svg" class="sea-logo" />
      <div class="sea-title">{{ t_('ForgetPassword') }}</div>
      <div class="sea-content">{{ t_('Because') }}</div>
      <div class="sea-tip">
        <div class="tip">{{ t_('Because1') }}</div>
        <div class="tip">{{ t_('Because2') }}</div>
      </div>
      <el-button
        type="primary"
        class="btn-start"
        :disabled="countDown0 > 0"
        @click="step = 1"
      >
        {{ t_('Start') }}
        <span v-if="countDown0 > 0">{{ countDown0 }}s</span>
      </el-button>
      <el-button type="text" @click="$router.back()">
        {{ t_('NotNow') }}
      </el-button>
      <Help />
    </template>
    <template v-else-if="step === 1">
      <el-form ref="form" label-position="top" :model="form" class="form">
        <el-form-item :label="t_('Email')" class="email">
          <el-input
            ref="email"
            v-model.trim="form.email"
            :readonly="loading"
            autofocus
            @keyup.enter.native="bindSendCode"
            @input="errorEmail = ''"
          />
        </el-form-item>
        <div v-show="errorEmail" class="error">{{ errorEmail }}</div>
        <el-form-item :label="t_('VerificationCode')" class="code">
          <el-input
            ref="code"
            v-model.trim="form.code"
            :readonly="loading"
            maxlength="6"
            type="tel"
            @keyup.enter.native="bindNext"
            @input="errorCode = ''"
          >
            <div slot="suffix" class="el-input__icon send-code">
              <el-button
                :disabled="!form.email || Boolean(countDown1)"
                :loading="loadingSend"
                @click="bindSendCode"
              >
                <template v-if="countDown1 > 0">
                  {{ t_('Resend') }} {{ countDown1 }}s
                </template>
                <template v-else>{{ t_('Send') }}</template>
              </el-button>
            </div>
          </el-input>
        </el-form-item>
        <div v-show="errorCode" class="error">{{ errorCode }}</div>
      </el-form>
      <el-button
        class="btn-next"
        type="primary"
        :disabled="!(form.code && form.code.length === 6 && form.email)"
        :loading="loading"
        @click="bindNext"
      >
        {{ t_('Verify') }}
      </el-button>
      <el-button type="text" class="btn-sign-up" @click="step = 2">
        {{ t_('noEmail') }}
      </el-button>
      <Help />
    </template>
    <template v-else-if="step === 2">
      <template v-if="ret.hasEmail === false">
        <img src="~/assets/img/unipass-no.svg" class="sea-logo" />
        <div class="sea-title">
          {{ t_('Unable') }}
          <br />
          {{ t_('Account') }}
        </div>
        <div class="sea-content">
          {{ t_('TrulySorry') }}
        </div>
        <div class="sea-tip">
          {{ t_('Please') }}
        </div>
        <nuxt-link to="/login" class="btn-return">
          <el-button type="primary"> {{ t_('ReturnLogin') }}</el-button>
        </nuxt-link>
      </template>
      <template v-else-if="ret.hasAsset">
        <img src="~/assets/img/assets-scan.svg" class="scan" />
        <div class="tip">
          {{ t_('YourUniPass') }}
          <a>{{ form.email }}</a>
          {{ t_('HasAssets') }}
        </div>
        <el-button type="primary" class="btn-confirm" @click="step = 3">
          {{ t_('ConfirmRecover') }}
        </el-button>
      </template>
      <template v-else-if="!ret.hasAsset">
        <img src="~/assets/img/assets-scan.svg" class="scan" />
        <div class="tip">
          {{ t_('YourUniPass') }}
          <a>{{ form.email }}</a>
          {{ t_('NoAssets') }}
        </div>
        <el-button type="primary" class="btn-return" @click="step = 3">
          {{ t_('Next') }}
        </el-button>
      </template>
      <Help />
    </template>
    <template v-else-if="step === 3">
      <template v-if="ckb.address">
        <img class="email-check" src="~/assets/img/email-check.svg" />
        <div class="sea-content">
          {{ t_('PleaseForward') }}
        </div>
        <div class="sea-account-info sea-colorful-border">
          <img src="~/assets/img/unipass-circle.svg" />
          <span class="sea-text-overflow">{{ ret.email }}</span>
        </div>
        <el-button type="primary" class="btn-recovery" @click="bindSendEmail">
          {{ t_('SendEmail') }}
        </el-button>
      </template>
      <template v-else>
        <Password
          :title="t_('NewPassword')"
          :loading="loading"
          @done="bindRecover"
        />
        <Help />
      </template>
    </template>
    <!-- 无资产 修改成功 -->
    <template v-else-if="step === 4">
      <img src="~/assets/img/unipass-right.svg" class="sea-logo" />
      <div class="sea-title">
        {{ t_('RecoveredSuccessfully1') }}
        <br />
        {{ t_('RecoveredSuccessfully2') }}
      </div>
      <div class="sea-content">
        {{ t_('NewAddress') }}
        <br />
        {{ t_('OldAddress') }}
      </div>
      <div class="sea-account-info sea-colorful-border">
        <img src="~/assets/img/unipass-circle.svg" />
        <span class="sea-text-overflow">{{ ret.email }}</span>
      </div>
      <el-button
        type="primary"
        class="btn-login"
        :loading="loading"
        @click="bindLogin"
      >
        {{ t_('Login') }}
      </el-button>
    </template>
    <!-- 有资产 转发邮件 -->
    <template v-else-if="step === 5">
      <div class="sea-title">{{ t_('AccountRecovery') }}</div>
      <img class="email-right" src="~/assets/img/email-right.svg" />
      <div class="sea-content">{{ t_('HasBeenReceived') }}</div>
      <nuxt-link to="/login" class="btn-ok">
        <el-button type="primary">{{ t_('OK') }}</el-button>
      </nuxt-link>
      <Help />
    </template>
  </div>
</template>
<script>
import Password from '~/components/password.vue'
import {
  isEmail,
  ckbAddress,
  recoverTempAccount,
  resetPassword,
  login,
} from '~/assets/js/unipass'
import {
  requestOtpCode,
  forgotPassword,
  getMails,
} from '~/assets/js/api-unipass'
export default {
  components: { Password },
  data() {
    return {
      loading: false,
      loadingSend: false,
      errorCode: '',
      errorEmail: '',
      step: 0,
      steps: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
      // step 0
      countDown0: 15,
      // step 1
      countDown1: 0,
      form: {
        code: '',
        email: '',
      },
      mails: [],
      // step 2
      ret: {
        hasAsset: false,
        hasEmail: false,
        otpToken: '',
        email: '',
        phone: '',
        status: 1,
      },
      // step 3
      password: '',
      password1: '',
      password2: '',
      ckb: {
        address: '',
        key: null,
        pubkey: '',
        pem: '',
      },
    }
  },
  computed: {
    user() {
      return this.$store.state.user
    },
    showSteps() {
      const { hasEmail } = this.ret
      if (this.step === 2 && !hasEmail) {
        return false
      }
      if (this.step > 0 && this.step < 4) {
        return true
      }
      return false
    },
  },
  created() {
    const id = setInterval(() => {
      if (this.countDown0 === 0) {
        clearInterval(id)
      } else {
        this.countDown0 = this.countDown0 - 1
      }
    }, 1000)
    this.initMails()
  },
  methods: {
    t_(key) {
      return this.$t('recover.' + key)
    },
    async bindLogin() {
      const password = this.password
      const email = this.ret.email
      if (email && password) {
        this.loading = true
        const res = await login(email, password)
        this.loading = false
        if (res.ok) {
          this.$store.commit('setUser', res.data)
          this.$router.replace('/login')
        } else if (res.msg === 'recovering') {
          this.error = this.$t('login.recovering')
        } else if (res.msg === 'warning') {
          this.error = this.$t('login.warning')
        } else {
          this.error = this.$t('login.unknown')
        }
      } else {
        this.$message.error(this.$t('login.unknown'))
      }
    },
    async bindSendCode() {
      const t_ = this.t_
      if (this.countDown1 !== 0) return
      const email = this.form.email.toLowerCase()
      if (!isEmail(email)) {
        this.errorEmail = t_('ErrorMailBox')
        this.$refs.email.focus()
        return
      }
      const suffix = email.slice(email.indexOf('@') + 1)
      if (!this.mails.includes(suffix)) {
        this.errorEmail = t_('ErrorMailBox')
        return
      }
      this.loadingSend = true
      const res = await requestOtpCode('forgotPassword', email)
      this.loadingSend = false
      if (res.ok) {
        this.countDown1 = 60
        const id = setInterval(() => {
          if (this.countDown1 === 0) {
            clearInterval(id)
          } else {
            this.countDown1 = this.countDown1 - 1
          }
        }, 1000)
      } else {
        let error = res.err.message
        if (error.includes('account not exist')) {
          // 账号未注册
          error = t_('ErrorEmailNotExist')
        }
        this.errorEmail = error
      }
    },
    async bindNext() {
      const t_ = this.t_
      const email = this.form.email.toLowerCase()
      if (!isEmail(email)) {
        this.errorEmail = t_('ErrorMailBox')
        this.$refs.email.focus()
        return
      }
      const code = this.form.code
      if (/^\d{6}$/.test(code) === false) {
        this.errorCode = t_('ErrorCodeSix')
        return
      }
      this.loading = true
      const res = await forgotPassword(code, email)
      this.loading = false
      if (res.ok) {
        this.ret = res.ret
        this.step = 2
      } else {
        let error = res.err.message
        if (error.includes('code verify failed')) {
          error = t_('ErrorCodeIncorrect')
        }
        this.errorCode = error
      }
    },
    bindRecover(password) {
      this.password = password
      if (this.ret.hasAsset) {
        this.hasAssets(password)
      } else {
        this.noAssets(password)
      }
    },
    async noAssets(password) {
      const token = this.ret.otpToken
      const email = this.ret.email
      this.loading = true
      const res = await resetPassword(email, password, token)
      this.loading = false
      if (res.ok) {
        this.step = 4
      } else {
        console.log(res)
        this.$message.error('reset password fail')
      }
    },
    async hasAssets(password) {
      try {
        const email = this.ret.email
        this.loading = true
        const res = await ckbAddress(email, password)
        this.loading = false
        if (res.ok) {
          this.ckb = res.data
        }
      } catch (err) {
        this.$message.error('no address')
      }
    },
    async bindSendEmail() {
      const password = this.password
      const ret = this.ret
      const token = ret.otpToken
      const { pubkey, pem, key } = this.ckb
      const { email, phone } = ret
      this.loading = true
      const res = await recoverTempAccount(
        password,
        email,
        token,
        phone,
        pubkey,
        pem,
        key,
      )
      this.loading = false
      if (res.ok) {
        this.step = 5
      } else {
        console.log(res)
        this.$message.error('恢复失败')
      }
    },
    async initMails() {
      const mails = await getMails()
      if (mails) {
        this.mails = mails
      }
    },
  },
}
</script>
<style lang="stylus">
#page-recover {
  .steps {
    margin-top: 20px;
    display: flex;
    text-align: center;
    width: 100%;

    .step {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;

      .box {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 8px;
        border: 1px solid var(--primary);
        color: var(--primary);
      }

      .box.right {
        background: var(--primary);
        color: white;
      }

      .name {
        margin-top: 8px;
        font-size: 12px;
        color: var(--text-regular);
      }

      .line {
        position: absolute;
        top: 14px;
        right: -21px;
        width: 42px;
        height: 1px;
        background: var(--sub);
      }

      .line.right {
        background: var(--primary);
      }
    }

    .step.active {
      .box {
        background: var(--primary);
        color: white;
      }
    }
  }

  &.step0 {
    .sea-content {
      margin-top: 30px;
    }

    .sea-tip {
      .tip + .tip {
        margin-top: 12px;
      }
    }

    .btn-start {
      margin-top: 24px;
      width: 100%;
    }

    .sea-help {
      margin-top: 32px;
    }
  }

  &.step1 {
    .btn-next {
      margin-top: 100px;
      width: 100%;
    }

    .form {
      margin-top: 30px;

      .error {
        color: var(--danger);
      }

      .code {
        margin-top: 35px;
      }
    }
  }

  &.step2 {
    .btn-return {
      margin-top: 100px;
      width: 100%;

      .el-button {
        width: 100%;
      }
    }

    .btn-confirm {
      margin-top: 50px;
      width: 100%;
    }

    .scan {
      margin-top: 40px;
      width: 127px;
      height: 127px;
    }

    .tip {
      margin-top: 39px;
      font-size: 14px;
      color: var(--text-regular);
      line-height: 22px;
    }
  }

  &.step3 {
    .email-check {
      margin-top: 40px;
      width: 142px;
      height: 109px;
    }

    .sea-content {
      margin-top: 40px;
      color: var(--text-regular);
    }

    .sea-account-info {
      margin-top: 30px;
    }

    .btn-recovery {
      margin-top: 30px;
      width: 100%;
    }
  }

  &.step4 {
    .sea-account-info {
      margin-top: 30px;
    }

    .btn-login {
      margin-top: 40px;
      margin-bottom: 20px;
      width: 100%;
    }
  }

  &.step5 {
    .email-right {
      margin-top: 40px;
      width: 142px;
      height: 109px;
    }

    .sea-content {
      margin-top: 40px;
      color: var(--text-regular);
    }

    .btn-ok {
      margin-top: 110px;
      width: 100%;

      .el-button {
        width: 100%;
      }
    }
  }
}
</style>
