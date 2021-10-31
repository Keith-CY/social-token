<template>
  <div>
    <video ref="camera" playsinline />
    <canvas ref="canvas" />
    <el-button type="primary" class="send" @click="start">
      {{ t_('scan') }}
    </el-button>
  </div>
</template>
<script>
import jsQR from 'jsqr'
import { Address, AddressType } from '@lay2/pw-core'
export default {
  data() {
    return {
      frameId: null,
    }
  },
  beforeUnmount() {
    this.cancel()
  },
  methods: {
    t_(key) {
      return this.$t('scanner.' + key)
    },
    async start() {
      try {
        const stream = await window.navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
          },
          audio: false,
        })
        if (!stream) {
          window.alert('no source found')
          return
        }
        const camera = this.$refs.camera
        const canvas = this.$refs.canvas
        const requestAnimationFrame =
          window.requestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.msRequestAnimationFrame

        camera.srcObject = stream
        camera.play()
        const tick = () => {
          if (camera.readyState === camera.HAVE_ENOUGH_DATA && canvas) {
            canvas.width = camera.videoWidth
            canvas.height = camera.videoHeight
            const ctx = canvas.getContext('2d')
            if (ctx) {
              const rect = [0, 0, canvas.width, canvas.height]
              ctx.drawImage(camera, ...rect)
              const imageData = ctx.getImageData(...rect)
              const code = jsQR(imageData.data, rect[2], rect[3], {
                inversionAttemps: 'dontInvert',
              })
              if (code && this.isAddressValid(code.data)) {
                this.$router.push({
                  name: 'send',
                  query: {
                    address: code.data,
                  },
                })
                console.log(code.data)
                camera.pause()
                this.cancel()
              }
            }
          }
          this.frameId = requestAnimationFrame(tick)
        }
        this.frameId = requestAnimationFrame(tick)
      } catch (err) {
        // TODO: error message should be treated with i18n
        window.alert(err)
      }
    },
    cancel() {
      if (this.frameId) {
        const cancelAnimationFrame =
          window.cancelAnimationFrame || window.mozCancelAnimationFrame

        cancelAnimationFrame(this.frameId)
      }
    },
    isAddressValid(address) {
      if (!address) {
        return false
      }

      try {
        if (address.startsWith('ckb') || address.startsWith('ckt')) {
          // eslint-disable-next-line no-new
          new Address(address, AddressType.ckb)
          return true
        }
        if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
          // eslint-disable-next-line no-new
          new Address(address, AddressType.eth)
          return true
        }
        return false
      } catch (error) {
        return false
      }
    },
  },
  export: {},
}
</script>
<style lang="stylus">
canvas {
  position: absolute;
  top: 100%;
  left: 100%;
  opacity: 0;
  width: 0;
  height: 0;
}
</style>
