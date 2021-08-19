<template>
  <div id="page-sign">
    <Pin
      :show.sync="pinShow"
      :type="pinType"
      page="sign"
      @done="bindNext"
      @close="loading = false"
    />
    <template v-if="type === 'reject'">
      <img src="~/assets/img/unipass-sign-fail.svg" class="sea-logo success" />
      <div class="sea-title">
        {{ t_('RejectedMessage1') }}
        <br />
        {{ t_('RejectedMessage2') }}
      </div>
    </template>
    <template v-else>
      <div class="sea-title">{{ t_('SignMessage') }}</div>
      <div class="from">{{ t_('From') }}{{ fromUrl }}</div>
      <el-form
        label-position="top"
        :model="query"
        class="form"
        @submit.native.prevent
      >
        <el-form-item :label="t_('Message')">
          <el-input
            v-model="query.message"
            type="textarea"
            readonly
            resize="none"
            class="message"
            show-word-limit
          >
          </el-input>
        </el-form-item>
      </el-form>
      <div class="btns">
        <el-button class="btn" :loading="loading" @click="bindReject">
          {{ t_('Reject') }}
        </el-button>
        <div class="space"></div>
        <el-button
          class="btn"
          type="primary"
          :loading="loading"
          @click="bindSign"
        >
          {{ t_('Sign') }}
        </el-button>
      </div>
    </template>
    <el-dialog
      class="unipass-dialog-close"
      :title="t_('DialogTitle')"
      :visible.sync="showSwitchLogin"
      :show-close="false"
      center
      top="50px"
      width="295px"
      append-to-body
    >
      <div class="btn left" @click="bindStill">{{ t_('Still') }}</div>
      <div class="btn right" @click="bindExit">{{ t_('Check') }}</div>
    </el-dialog>
  </div>
</template>
<script>
import { sign } from '~/assets/js/unipass'
export default {
  inject: ['reload'],
  data() {
    return {
      type: '',
      loading: false,
      pinShow: false,
      pinType: 'check',
      showSwitchLogin: false,
    }
  },
  computed: {
    successUrl() {
      return this.$store.state.query.success_url
    },
    fromUrl() {
      const url = this.query.success_url
      return url ? this.Sea.url(url).origin : ''
    },
    query() {
      return this.$store.state.query
    },
  },
  created() {
    const t_ = this.t_
    const query = this.query
    for (const key of ['success_url', 'pubkey', 'message']) {
      if (!query[key]) {
        // 缺少参数：
        this.$message.error(t_('Error') + key)
        setTimeout(() => {
          this.$router.back()
        }, 1500)
        return
      }
    }
  },
  methods: {
    t_(key) {
      return this.$t('sign.' + key)
    },
    bindStill() {
      this.showSwitchLogin = false
      const user = this.$store.state.user
      this.type = 'reject'
      setTimeout(() => {
        this.send({
          code: 401,
          info: 'pubkey not match',
          data: {
            email: user.account.email,
            pubkey: user.account.masterKey,
          },
        })
      }, 1000)
    },
    bindExit() {
      this.reload()
    },
    bindReject() {
      this.type = 'reject'
      setTimeout(() => {
        this.send({
          code: 400,
          info: 'sign fail',
          data: {},
        })
      }, 1000)
    },
    send(ret) {
      if (this.successUrl === 'open') {
        window.opener.postMessage(ret, '*')
        window.close()
      } else {
        const url = new URL(this.successUrl)
        url.searchParams.set('unipass_ret', JSON.stringify(ret))
        window.location.replace(url.href)
      }
    },
    bindSign() {
      const { pubkey } = this.query
      const user = this.$store.state.user
      if (user.account.masterKey !== pubkey) {
        this.showSwitchLogin = true
        return
      }
      // set 设置 pin
      // check 验证 pin
      this.pinType = user.authorization.endsWith('=') ? 'check' : 'set'
      this.pinShow = true
      this.loading = true
    },
    async bindNext(pin) {
      const user = this.$store.state.user
      const query = this.query
      const sig = await sign(pin, user, query.message)
      this.loading = false
      this.send({
        code: 200,
        info: 'sign success',
        data: {
          sig,
          pubkey: user.account.masterKey,
        },
      })
    },
  },
}
</script>
<style lang="stylus">
#page-sign {
  justify-content: space-around;
  margin: 0 40px;

  .from {
    width: 100%;
    word-break: break-all;
    padding: 0 10px;
    margin-top: 14px;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  .form {
    margin-top: 42px;

    .el-textarea.message {
      height: 280px;

      .el-textarea__inner {
        height: 100%;
      }
    }
  }

  .btns {
    margin-top: 44px;
    margin-bottom: 20px;
    display: flex;
    width: 100%;

    .btn {
      flex: 1;
    }

    .space {
      width: 14px;
    }
  }

  .sea-logo {
    margin-left: 20px;
  }
}
</style>
