<template>
  <div id="page-register">
    <img src="~/assets/img/unipass.svg" class="sea-logo" />
    <div class="sea-title">{{ t_('Sign') }}</div>
    <el-form ref="form" label-position="top" :model="form" class="form">
      <div class="hint" @mousedown="showHint = true">
        <img src="~/assets/img/hint.svg" />
        <span>{{ t_('SupportedEmail') }}</span>
      </div>
      <el-form-item :label="t_('Email')" class="email">
        <el-input
          ref="email"
          v-model.trim="form.email"
          :readonly="loading"
          @keyup.enter.native="bindSend"
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
              :disabled="!form.email || Boolean(countDown)"
              :loading="loadingSend"
              @mousedown.native="bindSend"
            >
              <template v-if="countDown > 0">
                {{ t_('Resend') }} {{ countDown }}s
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
      {{ t_('Next') }}
    </el-button>
    <nuxt-link to="/login">
      <el-button type="text" class="btn-sign-up">
        {{ t_('WithUniPass') }}
      </el-button>
    </nuxt-link>
    <el-dialog
      :visible.sync="showHint"
      center
      :title="t_('SupportedEmail')"
      width="90%"
      class="dialog-hint"
    >
      <div class="sea-content">
        {{ t_('UniPassDKIM') }}
      </div>
      <div class="mail">
        <img class="logo" src="~/assets/img/mail-google.svg" />
        <div class="suffix">
          <span>gmail.com</span>
          <span>googlemail.com</span>
        </div>
      </div>
      <div class="mail">
        <img class="logo" src="~/assets/img/mail-outlook.svg" />
        <div class="suffix">
          <span>outlook.com</span>
          <span>hotmail.com</span>
        </div>
      </div>
      <div class="mail">
        <img class="logo" src="~/assets/img/mail-qq.svg" />
        <div class="suffix">
          <span>qq.com</span>
          <span>foxmail.com</span>
        </div>
      </div>
      <div class="mail">
        <img class="logo" src="~/assets/img/mail-163.svg" />
        <div class="suffix">
          <span>163.com</span>
          <span>126.com</span>
          <span>188.com</span>
          <span>yeah.net</span>
        </div>
      </div>
      <div class="mail">
        <img class="logo" src="~/assets/img/mail-yahoo.svg" />
        <div class="suffix">
          <span>yahoo.com</span>
        </div>
      </div>
      <div class="mail">
        <img class="logo" src="~/assets/img/mail-mail.svg" />
        <div class="suffix">
          <span>mail.com</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { isEmail } from '~/assets/js/unipass'
import {
  requestOtpCode,
  verifyOtpCode,
  getMails,
} from '~/assets/js/api-unipass'
export default {
  data() {
    return {
      showHint: false,
      form: {
        code: '',
        email: '',
      },
      loading: false,
      loadingSend: false,
      errorEmail: '',
      errorCode: '',
      countDown: 0,
      mails: [],
    }
  },
  created() {
    const user = this.$store.state.user
    if (user.account.masterKey) {
      this.$router.replace('/login')
    }
    this.initMails()
  },
  methods: {
    t_(key) {
      return this.$t('register.' + key)
    },
    async bindSend() {
      const t_ = this.t_
      if (this.countDown !== 0) return
      const email = this.form.email.toLowerCase()
      if (!isEmail(email)) {
        // 邮箱格式不正确
        this.errorEmail = t_('ErrorMailBox')
        this.$refs.email.focus()
        return
      }
      const suffix = email.slice(email.indexOf('@') + 1)
      if (!this.mails.includes(suffix)) {
        this.showHint = true
        return
      }
      this.loadingSend = true
      const res = await requestOtpCode('register', email)
      this.loadingSend = false
      if (res.ok) {
        this.countDown = 60
        const id = setInterval(() => {
          if (this.countDown === 0) {
            clearInterval(id)
          } else {
            this.countDown = this.countDown - 1
          }
        }, 1000)
      } else {
        let error = res.err.message
        if (error.includes('account have already been registered')) {
          // 邮箱已注册
          error = t_('ErrorEmailRegistered')
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
        // 验证码为六位数字
        this.errorCode = t_('ErrorCodeSix')
        return
      }
      const user = this.$store.state.user
      this.loading = true
      const res = await verifyOtpCode('register', code, email)
      this.loading = false
      if (res.ok) {
        user.token = res.token
        user.account.email = email
        this.$router.push('/password')
      } else {
        let error = res.err.message
        if (error.includes('code verify failed')) {
          // 验证码失效
          error = t_('ErrorCodeIncorrect')
        }
        this.errorCode = error
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
#page-register {
  .dialog-hint {
    .el-dialog {
      border-radius: 16px;

      .el-dialog__header {
        font-size: 20px;
        font-weight: bold;
      }

      .el-dialog__body {
        padding-top: 0;
        text-align: center;

        .sea-content {
          color: var(--text-regular);
          margin-top: 0;
        }

        .mail {
          margin-top: 20px;

          .logo {
            height: 28px;
            width: 137px;
          }

          .suffix {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;

            span + span {
              margin-left: 10px;
            }
          }
        }
      }
    }
  }

  .form {
    margin-top: 30px;

    .hint {
      cursor: pointer;
      margin-bottom: -20px;
      justify-content: flex-end;
      display: flex;
      align-items: center;

      span {
        color: var(--primary);
        margin-left: 6px;
      }
    }

    .error {
      color: var(--danger);
    }

    .code {
      margin-top: 35px;
    }
  }

  .btn-next {
    margin-top: 70px;
    width: 100%;
  }
}
</style>
