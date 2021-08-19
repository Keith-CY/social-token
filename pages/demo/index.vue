<template>
  <div id="page-demo">
    <div class="title">{{ t_('Demo') }}</div>
    <div class="email">{{ provider.email || t_('PleaseLogin') }}</div>
    <el-collapse v-model="activeName" accordion>
      <el-collapse-item :title="t_('Jump')" name="1">
        <el-tabs v-model="activeName1" type="border-card">
          <el-tab-pane :label="t_('Login')" name="1">
            <el-button :loading="loading" @click="bindLogin">
              {{ t_('Login') }}
            </el-button>
          </el-tab-pane>
          <el-tab-pane :label="t_('Sign')" name="2">
            <el-button
              type="primary"
              :disabled="!provider.email"
              :loading="loading"
              @click="bindSign"
            >
              {{ t_('Sign') }}
            </el-button>
          </el-tab-pane>
        </el-tabs>
      </el-collapse-item>
      <el-collapse-item :title="t_('PopupWindow')" name="2-1">
        <el-tabs v-model="activeName1" type="border-card">
          <el-tab-pane :label="t_('Login')" name="1">
            <el-button :loading="loading" @click="bindOpenLogin">
              {{ t_('Login') }}
            </el-button>
          </el-tab-pane>
          <el-tab-pane :label="t_('Sign')" name="2">
            <el-button
              type="primary"
              :disabled="!provider.email"
              :loading="loading"
              @click="bindOpenSign"
            >
              {{ t_('Sign') }}
            </el-button>
          </el-tab-pane>
        </el-tabs>
      </el-collapse-item>
      <el-collapse-item title="Pubkey" name="3">
        <div class="pubkey">{{ provider.pubkey }}</div>
      </el-collapse-item>
      <el-collapse-item :title="t_('Low')" name="4">
        <div>{{ isBuiltInBrowser }}</div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
import { createHash } from 'crypto'

export default {
  data() {
    return {
      activeName: '2',
      activeName1: '1',
      loading: false,
      provider: {},
    }
  },
  // head: {
  //   link: [
  //     {
  //       rel: 'stylesheet',
  //       href: 'https://cdn.jsdelivr.net/npm/highlight.js@latest/styles/atom-one-light.css',
  //     },
  //   ],
  // },
  computed: {
    isBuiltInBrowser() {
      // https://cdn.jsdelivr.net/npm/bowser@2.11.0/src/parser-browsers.js
      if (process.client) {
        const userAgent = navigator.userAgent.toLowerCase()
        const list = ['micromessenger', 'qqbrowser', 'weibo', 'alipay']
        for (const browser of list) {
          if (userAgent.includes(browser)) {
            return true
          }
        }
      }
      return false
    },
  },
  beforeCreate() {
    if (process.env.NODE_ENV === 'production') {
      this.$router.replace('/')
    }
  },
  mounted() {
    const ret = this.Sea.json(this.$route.query.unipass_ret)
    this.init(ret)
    // message
    window.addEventListener('message', (event) => {
      const ret = event.data
      this.init(ret)
    })
  },
  methods: {
    init(ret) {
      if (ret && ret.data && ret.code) {
        console.log('unipass_ret', ret)
        if (ret.data.email) {
          this.Sea.localStorage('provider', ret.data)
        }
        this.Sea.params('unipass_ret', '')
      }
      const provider = this.Sea.localStorage('provider')
      this.provider = provider || {}
    },
    t_(key) {
      return this.$t('demo.' + key)
    },
    bindSign() {
      const message = 'demo'
      const pubkey = this.provider.pubkey
      const messageHash = createHash('SHA256')
        .update(message)
        .digest('hex')
        .toString()
      const successUrl = encodeURIComponent(window.location.href)
      const url = `${window.location.origin}/sign?success_url=${successUrl}&pubkey=${pubkey}&message=${messageHash}`
      window.location.href = url
    },
    bindLogin() {
      const successUrl = encodeURIComponent(window.location.href)
      const url = `${window.location.origin}/login?success_url=${successUrl}`
      window.location.href = url
    },
    bindOpenLogin() {
      if (this.isBuiltInBrowser) {
        this.$message.warning(this.t_('LowTip'))
        return
      }
      const unipassUrl = window.location.origin
      window.open(
        `${unipassUrl}/login?success_url=open`,
        '',
        'width=380,height=675,top=40,left=100,toolbar=no,scrollbars=yes,location=no,status=no',
      )
    },
    bindOpenSign() {
      if (this.isBuiltInBrowser) {
        this.$message.warning(this.t_('LowTip'))
        return
      }
      const message = 'demo'
      const pubkey = this.provider.pubkey
      const messageHash = createHash('SHA256')
        .update(message)
        .digest('hex')
        .toString()
      const unipassUrl = window.location.origin
      window.open(
        `${unipassUrl}/sign?success_url=open&pubkey=${pubkey}&message=${messageHash}`,
        '',
        'width=380,height=675,top=40,left=100,toolbar=no,scrollbars=yes,location=no,status=no',
      )
    },
  },
}
</script>
<style lang="stylus">
#page-demo {
  padding: 0 40px;

  pre {
    overflow: auto;
  }

  pre, code {
    font-family: Monaco, Menlo, Consolas, 'Courier New', Microsoft Yahei, sans-serif;
  }

  .title {
    font-size: 24px;
  }

  .email {
    margin-top: 10px;
  }

  .el-button {
    width: 100%;
  }

  .el-collapse {
    margin-top: 40px;
    width: 100%;
  }
}
</style>
