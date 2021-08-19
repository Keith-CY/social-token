import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'
Vue.use(
  new VueSocketIO({
    debug: false,
    connection: process.env.SOCKET_URL,
    options: {
      transports: ['websocket'],
    },
  }),
)
