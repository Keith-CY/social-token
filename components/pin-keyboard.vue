<template>
  <div id="dialog-pin-keyboard">
    <div class="keys">
      <div
        v-for="e in keys"
        :key="e"
        class="key"
        :class="{ active: key === e }"
      >
        <div v-if="e === 'empty'" class="key"></div>
        <span v-else @click="bindEnter(e)">{{ e }}</span>
      </div>
      <div class="key" :class="{ active: key === 'del' }">
        <span @click="bindDel">
          <img src="~/assets/img/pin-keyboard-del.svg" />
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      keys: [1, 2, 3, 4, 5, 6, 7, 8, 9, 'empty', 0],
      key: '',
      del: '',
    }
  },
  methods: {
    bindEnter(key) {
      this.key = key
      this.$emit('enter', key)
    },
    bindDel() {
      this.key = 'del'
      this.$emit('del')
    },
  },
}
</script>

<style lang="stylus">
#dialog-pin-keyboard {
  margin-top: 54px;
  background: var(--sub);
  font-size: 25px;
  font-weight: bold;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: calc(100% + 40px);

  .keys {
    padding: 22px 40px 12px;
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    width: 335px;

    .key {
      width: 33.333%;
      margin-bottom: 10px;
      display: flex;
      justify-content: center;

      span {
        cursor: pointer;
        user-select: none;
        width: 54px;
        height: 54px;
        border-radius: 18px;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      img {
        width: 26px;
        height: 20px;
      }
    }

    .key:nth-child(3n) {
      justify-content: flex-end;
    }

    .key:nth-child(3n + 1) {
      justify-content: flex-start;
    }

    .key:active {
      span {
        background: rgba(49, 121, 255, 0.09);
      }
    }
  }
}
</style>
