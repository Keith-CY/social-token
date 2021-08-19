import Vue from 'vue'
import VueI18n from 'vue-i18n'
import enLocale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
import ElementLocale from 'element-ui/lib/locale'

// 加入Vue全局
Vue.use(VueI18n)

export default ({ app }) => {
  app.i18n = new VueI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: {
      en: {
        ...enLocale,
        ...require('~/assets/lang/en.js'),
      },
      zh: {
        ...zhLocale,
        ...require('~/assets/lang/zh.js'),
      },
    },
  })

  // 配置element-ui的组件国际化
  ElementLocale.i18n((key, value) => app.i18n.t(key, value))
}
