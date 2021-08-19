// vuex 状态管理
const initState = {
  provider: {
    email: '',
    pubkey: '',
    address: '',
  },
}
const sotre = {
  // 严格模式
  strict: false,
  // 数据
  state() {
    return {
      ...initState,
      query: {
        success_url: '',
        pubkey: '',
        message: '',
        lang: '',
      },
      path: '',
    }
  },
  // 获取
  getters: {
    getUser(state) {
      return state.user
    },
  },
  // 同步更新
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    reload(state) {
      Object.assign(state, initState)
    },
  },
  // 异步更新
  actions: {
    // setUserAsync({ commit, state }, user) {
    //   commit('setUser', user)
    //   state.token = user
    // },
  },
  // 模块
  modules: {},
}
export default sotre

// 获取
// this.$store.state.toekn
// this.$store.getters.getUser
// 同步更新
// this.$store.state.toekn = 'dudu'
// this.$store.commit('setUser', 'dudu')
// 异步更新
// await this.$store.dispatch('setUserAsync', 'dudu')
