<template>
  <el-dialog
    id="dialog-tx"
    :show-close="false"
    fullscreen
    :modal="false"
    :visible.sync="showDialog"
    append-to-body
    @close="$emit('close')"
  >
    <Header class="tx" stop @close="showDialog = false" />
    {{ tx }}
  </el-dialog>
</template>
<script>
import Header from '~/components/header.vue'
export default {
  components: { Header },
  props: {
    tx: {
      type: Object,
      default: () => {
        return {}
      },
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {}
  },
  computed: {
    showDialog: {
      get() {
        return this.$props.show
      },
      set(val) {
        this.$emit('update:show', val)
      },
    },
  },
  methods: {
    t_(key) {
      return this.$t('components.tx.' + key)
    },
  },
}
</script>
<style lang="stylus">
#dialog-tx {
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
      background: #f6f7fb;
    }
  }
}
</style>
