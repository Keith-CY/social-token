<template>
  <div id="unipass" :class="$route.name">
    <div v-if="loading" id="unipass-loading"><span class="loader"></span></div>
    <Header />
    <Nuxt class="unipass-page" />
  </div>
</template>
<script>
import PWCore, { IndexerCollector } from '@lay2/pw-core'
import { getCkbEnv } from '~/assets/js/config'
import { getAddress } from '~/assets/js/unipass'
import UnipassProvider from '~/assets/js/UnipassProvider.ts'
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
    }
  },
  mounted() {
    this.init()
    if (this.$route.query.console !== undefined) {
      // eslint-disable-next-line
      new window.VConsole()
    }
  },
  methods: {
    reload() {
      this.refresh = true
      this.Sea.localStorage('provider', '')
      this.$store.commit('reload')
      this.$nextTick(() => {
        this.init()
      })
    },
    t_(key) {
      return this.$t('default.' + key)
    },
    init() {
      const provider = this.Sea.localStorage('provider')
      if (provider) {
        this.$store.state.provider = provider
        this.PWCore(provider)
        this.loading = false
      } else {
        this.login()
      }
    },
    login() {
      const ret = this.Sea.json(this.$route.query.unipass_ret)
      if (ret) {
        const provider = ret.data
        if (provider.pubkey && provider.email) {
          this.Sea.params('unipass_ret', '')
          provider.address = getAddress(provider.pubkey)
          this.Sea.localStorage('provider', provider)
          this.init()
          return
        }
      }
      window.location.href = `${process.env.UNIPASS_URL}/login?success_url=${window.location.href}`
    },
    async PWCore(provider) {
      const url = getCkbEnv()
      PWCore.chainId = url.CHAIN_ID
      await new PWCore(url.NODE_URL).init(
        new UnipassProvider(provider.email, provider.pubkey),
        new IndexerCollector(url.INDEXER_URL),
        url.CHAIN_ID,
      )
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
  #unipass-header {
    #unipass-back {
      display: none;
    }

    .account {
      display: none;
    }
  }
}
</style>
