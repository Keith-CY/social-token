<template>
  <el-form id="unipass-password" label-position="top" :model="form">
    <el-form-item :label="title || t_('Password')" class="password1">
      <el-input
        ref="password1"
        v-model="form.password1"
        :readonly="loading"
        :type="showPassword ? '' : 'password'"
        @keyup.enter.native="$refs.password2.focus()"
        @input="bindInput"
        @blur="bindBlur"
      >
        <div
          slot="suffix"
          class="el-input__icon show-password"
          @click="showPassword = !showPassword"
        >
          <img v-if="showPassword" src="~/assets/img/eyes.svg" />
          <img v-else src="~/assets/img/eyes-close.svg" />
        </div>
      </el-input>
      <div class="needs">
        <div v-for="(e, i) in needs" :key="i" class="need">
          <img :src="require(`~/assets/img/password-${initState(e.ok)}.svg`)" />
          <span>{{ t_(e.key) }}</span>
        </div>
      </div>
    </el-form-item>
    <el-form-item :label="t_('ConfirmPassword')" class="password2">
      <el-input
        ref="password2"
        v-model="form.password2"
        :readonly="loading"
        :type="showPassword ? '' : 'password'"
        :disabled="!check"
        @keyup.enter.native="bindNext"
        @input="error = ''"
      >
        <div
          slot="suffix"
          class="el-input__icon show-password"
          @click="showPassword = !showPassword"
        >
          <img v-if="showPassword" src="~/assets/img/eyes.svg" />
          <img v-else src="~/assets/img/eyes-close.svg" />
        </div>
      </el-input>
    </el-form-item>
    <div v-show="error" class="error">{{ error }}</div>
    <el-button
      class="btn-confirm"
      type="primary"
      round
      :disabled="!(form.password1 && form.password2)"
      :loading="loading"
      @click="bindNext"
    >
      {{ t_('Confirm') }}
    </el-button>
  </el-form>
</template>
<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      firstBlur: true,
      check: false,
      showPassword: false,
      form: {
        password1: '',
        password2: '',
      },
      needs: [
        // '8-20 位非空字符'
        { key: 're1', re: /^\S{8,20}$/, ok: false },
        // '至少一个大写字母'
        {
          key: 're2',
          re: /(?=.*[A-Z])(?=.*\S)[^]/,
          ok: false,
        },
        // '至少一个小写字母'
        {
          key: 're3',
          re: /(?=[a-z])[^]/,
          ok: false,
        },
        // '至少一个数字'
        { key: 're4', re: /(?=[\d]+)/, ok: false },
      ],
      error: '',
    }
  },
  methods: {
    t_(key) {
      return this.$t('components.password.' + key)
    },
    initState(ok) {
      if (ok) {
        return 'right'
      } else {
        return this.firstBlur ? 'wait' : 'wrong'
      }
    },
    bindNext() {
      const t_ = this.t_
      const { password1, password2 } = this.form
      if (password1 !== password2) {
        // '两次密码不相等'
        this.error = t_('PasswordNotSame')
        return
      }
      this.$emit('done', password1)
    },
    bindInput(password) {
      let check = true
      const arr = this.needs.map((e) => {
        const ok = e.re.test(password)
        if (ok === false) {
          check = false
        }
        return {
          ...e,
          ok,
        }
      })
      this.check = check
      this.needs = arr
    },
    bindBlur() {
      const { password1 } = this.form
      if (password1) {
        this.firstBlur = false
      }
    },
  },
}
</script>
<style lang="stylus">
#unipass-password {
  margin-top: 40px;

  .error {
    color: var(--danger);
  }

  .password1 {
    .needs {
      margin-top: 13px;
      line-height: 22px;

      .need {
        display: flex;
        align-items: center;

        img {
          width: 22px;
          height: 22px;
        }

        span {
          margin-left: 10px;
        }
      }

      .need + .need {
        margin-top: 10px;
      }
    }
  }

  .password2 {
    margin-top: 40px;
  }

  .btn-confirm {
    width: 100%;
    margin-top: 30px;
    margin-bottom: 20px;
  }
}
</style>
