<template>
  <el-dialog
    id="dialog-pin"
    :show-close="false"
    fullscreen
    :modal="false"
    :visible.sync="showDialog"
    append-to-body
    @close="$emit('close')"
  >
    <Header class="pin" stop @close="bindBack" />
    <template v-if="!pinType.startsWith('success')">
      <img
        v-show="focusPin === -1"
        src="~/assets/img/unipass.svg"
        class="sea-logo"
      />
    </template>
    <div class="pin-type" :class="pinType">
      <template v-if="pinType === 'set'">
        <div class="sea-title">{{ t_('SetPIN') }}</div>
        <div class="sea-content">{{ t_('KeepSafe') }}</div>
        <div class="pin-content">
          <div class="pin-top">
            <div v-if="pinType === 'forget-new'" class="tip">
              {{ t_('NewPIN') }}
            </div>
            <div v-else class="tip">{{ t_('ConfirmNewPIN') }}</div>
            <div
              class="show-password"
              @mousedown="showPassword = !showPassword"
            >
              <img v-if="showPassword" src="~/assets/img/eyes.svg" />
              <img v-else src="~/assets/img/eyes-close.svg" />
            </div>
          </div>
          <div class="pin-box">
            <template v-for="(e, i) in form.pins">
              <div
                :key="i"
                class="pin"
                :class="{
                  active: focusPin === i,
                  entered: e !== '',
                  dot: !showPassword,
                  text: showPassword,
                }"
                @click="focusPin = i"
              >
                <span v-if="e">
                  <div v-if="showPassword">{{ e }}</div>
                  <div v-else class="dot"></div>
                </span>
                <div class="cursor">|</div>
              </div>
            </template>
          </div>
          <div class="pin-bottom">
            <div class="error">{{ error }}</div>
          </div>
        </div>
        <PinKeyboard
          v-show="focusPin !== -1"
          @del="bindDel"
          @enter="bindEnter"
        />
        <el-button
          v-show="focusPin === -1"
          class="btn-confirm"
          type="primary"
          :loading="loading"
          @click="bindPinSet"
        >
          {{ t_('Confirm') }}
        </el-button>
      </template>
      <template v-else-if="pinType === 'check'">
        <div class="sea-title">
          {{ t_('InputPIN') }}
          <br />
          {{ t_('Account') }}
        </div>
        <div class="pin-content">
          <div class="pin-top">
            <div class="tip">{{ t_('CheckTip') }}</div>
            <div
              class="show-password"
              @mousedown="showPassword = !showPassword"
            >
              <img v-if="showPassword" src="~/assets/img/eyes.svg" />
              <img v-else src="~/assets/img/eyes-close.svg" />
            </div>
          </div>
          <div class="pin-box">
            <template v-for="(e, i) in form.pins">
              <div
                :key="i"
                class="pin"
                :class="{
                  active: focusPin === i,
                  entered: e !== '',
                  dot: !showPassword,
                  text: showPassword,
                }"
                @click="focusPin = i"
              >
                <span v-if="e">
                  <div v-if="showPassword">{{ e }}</div>
                  <div v-else class="dot"></div>
                </span>
                <div class="cursor">|</div>
              </div>
            </template>
          </div>
          <div class="pin-bottom">
            <div class="error">{{ error }}</div>
            <el-button
              class="btn-forget"
              type="text"
              :loading="loading"
              @click="bindForget"
            >
              {{ t_('ForgetPIN') }}
            </el-button>
          </div>
        </div>
        <PinKeyboard
          v-show="focusPin !== -1"
          @del="bindDel"
          @enter="bindEnter"
        />
      </template>
      <template v-else-if="pinType.startsWith('forget')">
        <div class="sea-title">{{ t_('ResetPIN') }}</div>
        <template v-if="pinType === 'forget'">
          <div class="sea-content">{{ t_('ResetContent') }}</div>
          <div class="tip">{{ t_('ResetTip') }}</div>
          <el-form
            label-position="top"
            :model="form"
            class="form"
            @submit.native.prevent
          >
            <el-form-item :label="t_('Password')">
              <el-input
                ref="password"
                v-model="form.password"
                :readonly="loading"
                class="password"
                :type="showPassword ? '' : 'password'"
                @keyup.enter.native="bindPinForget"
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
              <div class="password-bottom">
                <div class="error">{{ error }}</div>
                <nuxt-link to="/recover">
                  <el-button class="btn-forget" type="text" :loading="loading">
                    {{ t_('ForgetPassword') }}
                  </el-button>
                </nuxt-link>
              </div>
            </el-form-item>
          </el-form>
          <el-button
            class="btn-confirm"
            type="primary"
            :loading="loading"
            @click="bindPinForget"
          >
            {{ t_('Confirm') }}
          </el-button>
        </template>
        <template
          v-else-if="['forget-new', 'forget-confirm'].includes(pinType)"
        >
          <div class="sea-content">
            {{ t_('ForgetContent') }}
          </div>
          <div class="pin-content">
            <div class="pin-top">
              <div v-if="pinType === 'forget-new'" class="tip">
                {{ t_('NewPIN') }}
              </div>
              <div v-else class="tip">{{ t_('ConfirmNewPIN') }}</div>
              <div
                class="show-password"
                @mousedown="showPassword = !showPassword"
              >
                <img v-if="showPassword" src="~/assets/img/eyes.svg" />
                <img v-else src="~/assets/img/eyes-close.svg" />
              </div>
            </div>
            <div class="pin-box">
              <template v-for="(e, i) in form.pins">
                <div
                  :key="i"
                  class="pin"
                  :class="{
                    active: focusPin === i,
                    entered: e !== '',
                    dot: !showPassword,
                    text: showPassword,
                  }"
                  @click="focusPin = i"
                >
                  <span v-if="e">
                    <div v-if="showPassword">{{ e }}</div>
                    <div v-else class="dot"></div>
                  </span>
                  <div class="cursor">|</div>
                </div>
              </template>
            </div>
            <div class="pin-bottom">
              <div class="error">{{ error }}</div>
            </div>
          </div>
          <el-button
            v-show="focusPin === -1"
            class="btn-confirm"
            type="primary"
            :loading="loading"
            @click="bindPinNew"
          >
            {{ t_('Confirm') }}
          </el-button>
          <PinKeyboard
            v-show="focusPin !== -1"
            @del="bindDel"
            @enter="bindEnter"
          />
        </template>
      </template>
      <template v-else-if="pinType === 'success'">
        <img src="~/assets/img/unipass-lock.svg" class="sea-logo success" />
        <div class="sea-title">
          {{ t_('PINRested') }}
          <br />
          {{ t_('Successfully') }}
        </div>
      </template>
      <template v-else-if="pinType === 'success-sign'">
        <img src="~/assets/img/unipass-sign.svg" class="sea-logo success" />
        <div class="sea-title">{{ t_('Signed') }} {{ t_('Successfully') }}</div>
      </template>
      <template v-else-if="pinType === 'success-login'">
        <img src="~/assets/img/unipass-right.svg" class="sea-logo success" />
        <div class="sea-title">{{ t_('Login') }} {{ t_('Successfully') }}</div>
      </template>
    </div>
  </el-dialog>
</template>
<script>
import { setPin, checkPin, forgetPin, checkLogin } from '~/assets/js/unipass'
import Header from '~/components/header.vue'
import PinKeyboard from '~/components/pin-keyboard.vue'
export default {
  components: { Header, PinKeyboard },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'check',
    },
    page: {
      type: String,
      default: 'login',
    },
  },
  data() {
    return {
      loading: false,
      pinType: this.type,
      pin: '',
      pinNew: '',
      form: {
        pins: ['', '', '', '', '', ''],
        password: '',
      },
      focusPin: 0,
      error: '',
      showPassword: false,
    }
  },
  computed: {
    showDialog: {
      get() {
        return this.$props.show
      },
      set(val) {
        if (val === false) {
          this.Sea('#unipass-back').show()
        }
        this.$emit('update:show', val)
      },
    },
  },

  watch: {
    type(nv) {
      this.pinType = nv
    },
  },
  created() {
    this.$root.$on('bindBack', () => {
      this.bindBack()
    })
  },
  methods: {
    t_(key) {
      return this.$t('components.pin.' + key)
    },
    bindEnter(key) {
      this.$set(this.form.pins, this.focusPin, String(key))
      // error
      if (this.error) {
        this.error = ''
      }
      // check
      const pin = this.form.pins.filter((e) => e)
      if (pin.length === 6) {
        if (this.pinType === 'check') {
          this.bindPinChcek()
        } else {
          this.focusPin = -1
        }
        return
      }
      // next
      const next = this.focusPin + 1
      if (next === 6) {
        if (this.pinType === 'check') {
          this.bindPinChcek()
        } else {
          this.focusPin = -1
        }
      } else {
        this.focusPin = next
      }
    },
    bindDel() {
      this.$set(this.form.pins, this.focusPin, '')
      const prev = this.focusPin - 1
      if (prev >= 0) {
        this.focusPin = prev
      }
    },
    initPin() {
      let pin = ''
      const pins = this.form.pins
      for (let i = 0; i < pins.length; i++) {
        const e = pins[i]
        if (e) {
          pin += e
        } else {
          this.focusPin = i
          return
        }
      }
      return pin
    },
    done(pinType, pin) {
      this.pinType = pinType
      this.Sea('#unipass-back').hide()
      setTimeout(() => {
        this.$emit('done', pin)
      }, 1000)
    },
    async bindPinSet() {
      const pin = this.initPin()
      if (pin) {
        this.loading = true
        await setPin(pin, this.$store.state.user)
        this.loading = false
        const pinType = this.page === 'login' ? 'success-login' : 'success-sign'
        this.done(pinType, pin)
      }
    },
    async bindPinChcek() {
      const pin = this.initPin()
      if (pin) {
        this.loading = true
        const ok = await checkPin(pin, this.$store.state.user)
        this.loading = false
        if (ok) {
          const pinType =
            this.page === 'login' ? 'success-login' : 'success-sign'
          this.done(pinType, pin)
        } else {
          this.error = this.t_('ErrorPIN')
          // clear
          this.focusPin = 0
          const pins = this.form.pins
          for (let i = 0; i < pins.length; i++) {
            this.form.pins[i] = ''
          }
        }
      }
    },
    async bindPinForget() {
      const password = this.form.password
      if (!password) {
        this.$refs.password.focus()
        return
      }
      const user = this.$store.state.user
      this.loading = true
      const res = await checkLogin(user, password)
      this.loading = false
      if (res.ok) {
        this.pinType = 'forget-new'
      } else {
        this.error = this.t_('ErrorPassword')
      }
    },
    clear() {
      this.focusPin = 0
      this.error = ''
      const pins = this.form.pins
      for (let i = 0; i < pins.length; i++) {
        this.form.pins[i] = ''
      }
    },
    async bindPinNew() {
      const pin = this.initPin()
      if (!pin) {
        this.error = this.t_('ErrorDigit')
        return
      }
      if (this.pinType === 'forget-new') {
        this.pinNew = pin
        this.clear()
        this.pinType = 'forget-confirm'
      } else if (this.pinType === 'forget-confirm') {
        const password = this.form.password
        if (pin === this.pinNew) {
          const user = this.$store.state.user
          this.loading = true
          const ok = await forgetPin(pin, user, password)
          this.loading = false
          if (ok) {
            this.done('success', pin)
          }
        } else {
          this.error = this.t_('ErrorNotEqual')
        }
      }
    },
    bindForget() {
      if (this.pinType === 'check') {
        this.pinType = 'forget'
        this.clear()
      }
    },
    bindBack() {
      if (this.pinType === 'forget') {
        this.pinType = 'check'
      } else if (this.pinType === 'forget-confirm') {
        this.pinType = 'forget-new'
      } else if (this.pinType === 'forget-new') {
        this.pinType = 'forget'
      } else {
        this.showDialog = false
      }
    },
  },
}
</script>
<style lang="stylus">
#dialog-pin {
  > .el-dialog {
    > .el-dialog__header {
      padding: 0;
    }

    > .el-dialog__body {
      display: flex;
      align-items: center;
      flex-direction: column;
      min-height: 100vh;
      padding: 0 20px;
    }
  }

  .pin-type {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    word-break: break-word;
    flex: 1;

    .error {
      color: var(--danger);
    }

    .btn-forget {
      padding: 10px 0;
    }

    .pin-content {
      margin-top: 48px;
      max-width: 335px;
      width: 100%;

      .pin-top {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .tip {
          font-style: italic;
          color: var(--text-regular);
        }

        .show-password {
          padding: 12px 0 12px 20px;
          user-select: none;
          display: flex;
          align-items: center;
          cursor: pointer;
          height: 100%;
        }
      }

      .pin-box {
        display: flex;
        justify-content: space-between;

        .pin {
          user-select: none;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          border: 1px solid var(--sub);
          position: relative;

          .cursor {
            display: none;
          }

          .dot {
            width: 6px;
            height: 6px;
            background: black;
            border-radius: 50%;
          }
        }

        .pin.active, .pin.entered {
          border: 1px solid transparent;
          background-image: linear-gradient(#fff, #fff), linear-gradient(320deg, var(--primary), var(--secondary));
          background-clip: padding-box, border-box;
          background-origin: border-box;
        }

        .pin.active {
          @keyframes blink {
            0%, 100% {
              color: transparent;
            }

            50% {
              color: var(--text-primary);
            }
          }

          .cursor {
            display: flex;
            position: absolute;
            animation: blink 1.2s infinite steps(1, start);
          }
        }

        .pin.entered {
          .cursor {
            display: none;
          }
        }

        .pin.active.entered.dot {
          .dot {
            @keyframes blinkBackgorund {
              0%, 100% {
                background: transparent;
              }

              50% {
                background: var(--text-primary);
              }
            }

            animation: blinkBackgorund 1.2s infinite steps(1, start);
          }
        }

        .pin.active.entered.text {
          animation: blink 1.2s infinite steps(1, start);
        }
      }

      .pin-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .error {
          padding: 10px 0;
        }
      }
    }

    &.set, &.forget, &.forget-new, &.forget-confirm {
      .tip {
        width: 100%;
        margin-top: 14px;
        font-size: 14px;
        color: var(--text-primary);
      }

      .form {
        margin-top: 40px;

        .password-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      }

      .btn-confirm {
        margin-top: 40px;
        width: 100%;
      }
    }

    &.set, &.forget-new, &.forget-confirm {
      .btn-confirm {
        margin-top: 120px;
      }
    }

    &.set {
      .btn-confirm {
        margin-bottom: 20px;
      }
    }
  }
}
</style>
