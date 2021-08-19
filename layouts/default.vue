<template>
  <div id="unipass" :class="$route.name">
    <div v-if="loading" id="unipass-loading"><span class="loader"></span></div>
    <template v-if="refresh === false">
      <Header />
      <Nuxt
        class="unipass-page"
        keep-alive
        :keep-alive-props="{ include: ['Home'] }"
      />
    </template>
  </div>
</template>
<script>
import { getUser, getAddress, logout } from '~/assets/js/unipass'
import Header from '~/components/header.vue'

export default {
  components: { Header },
  provide() {
    return {
      reload: this.reload,
    }
  },
  data() {
    return {
      loading: true,
      refresh: false,
    }
  },
  created() {
    if (process.client) {
      this.init()
    }
    // save path and query
    this.$store.state.path = this.$route.path
    this.$store.state.query = this.$route.query
  },
  mounted() {
    if (this.$route.query.console !== undefined) {
      // eslint-disable-next-line
      new window.VConsole()
    }
  },
  methods: {
    reload() {
      logout()
      this.refresh = true
      // window.location.reload()
      this.Sea.localStorage('provider', '')
      this.$store.commit('reload')
      this.$nextTick(() => {
        this.init()
      })
    },
    t_(key) {
      return this.$t('default.' + key)
    },
    async init() {
      const user = await getUser()
      this.loading = false
      this.refresh = false
      const path = this.$route.path
      const pathList = ['/login', '/register', '/recover', '/password']
      if (user && user.account.masterKey) {
        if (!user.address) {
          user.address = getAddress(user.account.masterKey)
        }
        // logged in
        this.$store.commit('setUser', user)
        this.$root.$emit('setUser', user)
        if (path === '/login') {
          // login continue
        } else if (pathList.includes(path)) {
          // logged in blacklist
          this.$router.replace('/')
        }
      } else {
        // Not logged in
        pathList.push('/demo')
        // Not logged in whitelist
        if (pathList.includes(path)) {
          // register or recover continue
        } else if (path === '/') {
          this.$router.replace('/login')
        } else {
          this.$router.push('/login')
        }
      }
    },
  },
}
</script>
<style lang="stylus">
#unipass {
  display: flex;
  align-items: center;
  flex-direction: column;
  min-height: 100vh;
  padding: 0 20px;
  max-width: 480px;
  background: #FFF;
  margin: 0 auto;
  overflow: hidden;

  // https://vineethtrv.github.io/loader/
  > #unipass-loading {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    background: rgba(255, 255, 255, 0.84);
    display: flex;
    align-items: center;
    justify-content: center;

    @keyframes rotation {
      0% {
        transform: rotate(0deg);
      }

      100% {
        transform: rotate(360deg);
      }
    }

    .loader {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: inline-block;
      border-top: 3px solid var(--primary);
      border-right: 3px solid transparent;
      box-sizing: border-box;
      animation: rotation 1s linear infinite;
    }
  }

  > .unipass-page {
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
  }
}

#unipass.index {
  background: #F6F7FB;

  .el-loading-mask {
    background: rgba(244, 246, 250, 0.9);
  }

  #unipass-header {
    #unipass-back {
      display: none;
    }

    .account {
      display: none;
    }

    .btn.right {
      top: 13px;
    }
  }
}

#unipass.nft {
  #unipass-header {
    .account {
      display: none;
    }
  }
}

#unipass.demo {
  #unipass-header {
    .account {
      display: none;
    }
  }
}
</style>
