<template>
  <div class="sea-help">
    {{ t_('PleaseContact') }}
    <a href="mailto:support@unipass.me">
      {{ t_('Email') }}
    </a>
    {{ t_('NeedHelp') }}
  </div>
</template>
<script>
export default {
  methods: {
    t_(key) {
      return this.$t('components.help.' + key)
    },
  },
}
</script>
<style lang="stylus">
.sea-help {
  margin-top: 67px;
  margin-bottom: 32px;
  font-size: 12px;
  color: var(--text-regular);
}
</style>
