// import path from 'path'
// import fs from 'fs'
export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'UniPass',
    meta: [
      { charset: 'utf-8' },
      {
        name: 'viewport',
        content:
          'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no',
      },
      { hid: 'description', name: 'description', content: '' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      // {
      //   rel: 'stylesheet',
      //   href: 'https://cdn.jsdelivr.net/npm/normalize.css@latest/normalize.min.css',
      // },
    ],
    script: [
      {
        src: 'https://cdn.jsdelivr.net/npm/vconsole@latest/dist/vconsole.min.js',
      },
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['@assets/css/main.scss'],

  // Global loading https://www.nuxtjs.cn/api/configuration-loading
  loading: {
    color: '#3179ff',
  },

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/bigsea',
    '~/plugins/axios',
    '~/plugins/element-ui',
    '~/plugins/main',
    '~/plugins/socket',
    '~/plugins/i18n',
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    '@nuxtjs/dotenv',
    'nuxt-compress',
    '@nuxtjs/google-gtag',
  ],
  'google-gtag': {
    id: process.env.UNIPASS_GA,
  },
  'nuxt-compress': {
    gzip: {
      threshold: 8192,
    },
    brotli: {
      threshold: 8192,
    },
  },

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    // '@nuxtjs/pwa',
    // https://go.nuxtjs.dev/content
    // '@nuxt/content',
    '@nuxtjs/sentry',
  ],

  sentry: {
    dsn: 'https://f4455f0b8ed44a3abb1d91eb816f548c@o952186.ingest.sentry.io/5901525', // Enter your project's DSN here
    // Additional Module Options go here
    // https://sentry.nuxtjs.org/sentry/options
    config: {
      // Add native Sentry config here
      // https://docs.sentry.io/platforms/javascript/guides/vue/configuration/options/
      tracesSampleRate: 1.0,
    },
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  // pwa: {
  //   manifest: {
  //     name: 'UniPass',
  //     short_name: 'UniPass',
  //     lang: 'en',
  //   },
  //   icon: {
  //     fileName: 'icon.png',
  //   },
  // },

  // Content module configuration: https://go.nuxtjs.dev/config-content
  content: {},

  router: {
    base: '/',
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    // analyze: process.env.NODE_ENV === 'production',
    transpile: [/^element-ui/],
    publicPath: process.env.OSS_PUBLIC_PATH,
    optimization: {
      splitChunks: {
        minSize: 10000,
        maxSize: 250000,
      },
    },
  },
  env: {
    environment: process.env.NODE_ENV,
  },

  // eslint
  eslint: {
    fix: true,
  },

  // server
  server: {
    // host: '0.0.0.0',
    port: 5003,
    // https: {
    //   key: fs.readFileSync(path.resolve(__dirname, 'bin/cert.key')),
    //   cert: fs.readFileSync(path.resolve(__dirname, 'bin/cert.crt')),
    // },
  },
}
