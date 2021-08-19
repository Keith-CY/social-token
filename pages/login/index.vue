<template>
  <div id="page-login">
    <Pin
      :show.sync="pinShow"
      page="login"
      @done="bindPin"
      @close="loading = false"
    />
    <img src="~/assets/img/unipass.svg" class="sea-logo" />
    <template v-if="isLogged">
      <div class="sea-title">
        {{ t_('titleContinue') }}
      </div>
      <div class="sea-account-info sea-colorful-border">
        <img src="~/assets/img/unipass-circle.svg" />
        <span class="sea-text-overflow">{{ user.account.email }}</span>
      </div>
      <el-button
        type="primary"
        :loading="loading"
        class="continue"
        @click="bindContinue"
      >
        {{ t_('continue') }}
      </el-button>
      <el-button type="text" :loading="loading" @click="bindExit">
        {{ t_('another') }}
      </el-button>
    </template>
    <template v-else>
      <div class="sea-title">{{ t_('title') }}<br />{{ t_('subtitle') }}</div>
      <el-form label-position="top" :model="form" class="form">
        <el-form-item :label="t_('account')">
          <el-input
            ref="account"
            v-model="form.account"
            :readonly="loading"
            class="account"
            @keyup.enter.native="$refs.password.focus()"
            @input="error = ''"
          />
        </el-form-item>
        <div v-show="error" class="error">{{ error }}</div>
        <el-form-item :label="t_('password')" class="code">
          <el-input
            ref="password"
            v-model="form.password"
            :readonly="loading"
            class="password"
            :type="showPassword ? '' : 'password'"
            @keyup.enter.native="bindLogin"
            @input="error = ''"
          >
            <div
              slot="suffix"
              class="el-input__icon show-password"
              @mousedown="showPassword = !showPassword"
            >
              <img v-if="showPassword" src="~/assets/img/eyes.svg" />
              <img v-else src="~/assets/img/eyes-close.svg" />
            </div>
          </el-input>
        </el-form-item>
      </el-form>
      <a class="forget" @mousedown="$router.push('/recover')">
        {{ t_('forget') }}
      </a>
      <el-button
        class="btn-login"
        type="primary"
        :loading="loading"
        :disabled="!(form.password && form.account)"
        @mousedown.native="bindLogin"
      >
        {{ t_('login') }}
      </el-button>
      <el-button
        type="text"
        class="btn-sign-up"
        @mousedown.native="$router.push('/register')"
      >
        {{ t_('signUp') }}
      </el-button>
    </template>
  </div>
</template>
<script>
import { login } from '~/assets/js/unipass'
export default {
  inject: ['reload'],
  data() {
    return {
      loading: false,
      form: {
        account: '',
        password: '',
      },
      showPassword: false,
      error: '',
      pinShow: false,
      pinChecked: false,
    }
  },
  computed: {
    successUrl() {
      return this.$store.state.query.success_url
    },
    user() {
      return this.$store.state.user
    },
    isLogged() {
      return Boolean(this.user.account.masterKey)
    },
  },
  created() {
    this.$root.$on('setUser', (user) => {
      if (user.authorization.endsWith('=')) {
        this.pinShow = true
      }
    })
  },
  methods: {
    t_(key) {
      return this.$t('login.' + key)
    },
    bindPin() {
      this.pinChecked = true
      this.bindContinue()
    },
    bindExit() {
      this.reload()
    },
    bindContinue() {
      if (!this.successUrl) {
        this.$router.push('/')
        return
      }
      const hasPin = this.user.authorization.endsWith('=')
      if (hasPin && !this.pinChecked) {
        this.pinShow = true
        return
      }
      const { path, query } = this.$store.state
      if (path !== '/login') {
        this.$router.replace({ path, query })
        return
      }
      const user = this.$store.state.user
      const ret = {
        code: 200,
        info: 'login success',
        data: {
          email: user.account.email,
          pubkey: user.account.masterKey,
        },
      }
      if (this.successUrl === 'open') {
        window.opener.postMessage(ret, '*')
        window.close()
      } else {
        const url = new URL(this.successUrl)
        url.searchParams.set('unipass_ret', JSON.stringify(ret))
        window.location.replace(url.href)
      }
    },
    async bindLogin() {
      const { account, password } = this.form
      if (!account) {
        this.$refs.account.focus()
        return
      }
      if (!password) {
        this.$refs.password.focus()
        return
      }
      this.loading = true
      const res = await login(account, password)
      if (res.ok) {
        this.$store.commit('setUser', res.data)
        if (this.successUrl) {
          this.bindContinue()
        } else {
          await this.$router.replace('/')
        }
      } else if (res.msg === 'recovering') {
        this.error = this.$t('login.recovering')
      } else if (res.msg === 'warning') {
        this.error = this.$t('login.warning')
      } else {
        this.error = this.$t('login.unknown')
      }

      this.loading = false
    },
  },
}
</script>
<style lang="stylus">
#page-login {
  .error {
    color: var(--danger);
    margin-bottom: 14px;
  }

  .form {
    margin-top: 30px;

    .code {
      margin-top: 35px;
    }
  }

  .forget {
    align-self: flex-end;
  }

  .btn-login {
    width: 100%;
    margin-top: 38px;
  }

  .btn-sign-up {
    padding-bottom: 12px;
  }

  .continue {
    width: 100%;
    margin-top: 185px;
  }
}
</style>
