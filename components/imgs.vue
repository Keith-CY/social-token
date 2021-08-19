<template>
  <el-image
    class="imgs"
    :class="{ background }"
    :src="srcFormat"
    :fit="fit"
    :style="style"
    v-bind="$attrs"
    v-on="$listeners"
    ><div slot="error" class="error-slot">
      <img src="~/assets/img/image-fail.svg" /></div
  ></el-image>
</template>
<script>
export default {
  props: {
    src: {
      type: String,
      default: '',
    },
    fit: {
      type: String,
      default: 'cover',
    },
    h: {
      type: [String, Number],
      default: 420,
    },
    background: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      list: ['aliyuncs.com', 'oss.jinse.cc'],
    }
  },
  computed: {
    srcFormat() {
      const src = this.Sea.url(this.src || '')
      for (const white of this.list) {
        if (src.host.endsWith(white)) {
          src.query['x-oss-process'] = `image/resize,h_${this.h},m_lfit`
        }
      }
      return this.Sea.url(src)
    },
    style() {
      const style = {}
      if (this.background) {
        style['background-image'] = `url('${this.srcFormat}')`
      }
      return style
    },
  },
}
</script>
<style lang="stylus">
.imgs {
  .error-slot {
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 40px;
    }
  }
}

.imgs.background {
  height: 0;
  width: 100%;
  padding-bottom: 100%;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;

  .error-slot {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    img {
      width: 40px;
    }
  }
}
</style>
