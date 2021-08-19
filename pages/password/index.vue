<template>
  <div id="page-password">
    <div class="sea-title">{{ t_('title') }}</div>
    <div class="sea-content">
      {{ t_('content') }}
    </div>
    <Password :loading="loading" @done="bindRegister" />
  </div>
</template>
<script>
import Password from '~/components/password.vue'
import { register, login } from '~/assets/js/unipass'
export default {
  components: { Password },
  data() {
    return {
      loading: false,
    }
  },
  created() {
    const user = this.$store.state.user
    if (!user.token) {
      this.$router.replace('/login')
    }
  },
  methods: {
    t_(key) {
      return this.$t('password.' + key)
    },
    async bindRegister(password) {
      const user = this.$store.state.user
      const email = user.account.email
      this.loading = true
      const res = await register(email, password, user)
      this.loading = false
      if (res.ok) {
        this.login(email, password)
      } else {
        this.error = res.msg
      }
    },
    async login(account, password) {
      const res = await login(account, password)
      if (res.ok) {
        this.$store.commit('setUser', res.data)
        this.$router.replace('/login')
      } else if (res.msg === 'recovering') {
        this.$message.error(this.$t('login.recovering'))
      } else if (res.msg === 'warning') {
        this.$message.error(this.$t('login.warning'))
      } else {
        this.$message.error(this.$t('login.unknown'))
      }
    },
  },
}
</script>
<style lang="stylus">
#page-password {
  .sea-title {
    margin-top: 16px;
  }
}
</style>
