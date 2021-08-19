<template>
  <div id="page-nft">
    <imgs :src="nft.renderer" class="blur" />
    <main>
      <imgs class="container" :src="nft.renderer" fit="contain" />
      <h1>{{ nft.name }}</h1>
      <p>{{ nft.description || '' }}</p>
      <div class="user">
        <div class="user-name">
          <imgs
            class="user-avator"
            :src="nft.issuerAvatarUrl"
            :h="40"
            alt="user-avator"
          />
          <span>{{ nft.issuerName }}</span>
        </div>
        <div class="user-total">
          <div>
            {{ t_('have') }} {{ nft.children ? nft.children.length : 1 }} /
            {{ t_('quantum') }}
            {{ nft.total === 0 ? t_('unlimited') : nft.total }}
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
<script>
export default {
  data() {
    return {
      nft: {},
    }
  },
  created() {
    const nft = this.$store.state.nft
    if (nft && nft.name) {
      this.init(nft)
    } else {
      this.$router.replace('/')
    }
  },
  methods: {
    t_(key) {
      return this.$t(`nft.${key}`)
    },
    init(nft) {
      if (nft.children === undefined) {
        nft.children = []
      }
      this.nft = nft
      // nft.issued 已分发
      // nft.tokenId 当前 id
    },
  },
}
</script>
<style lang="stylus">
#page-nft {
  .blur {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    filter: blur(180px);
    width: 100%;
    height: 100%;
  }

  > main {
    color: hsla(0, 0%, 0%, 0.6);
    text-align: center;
    z-index: 2;
    position: relative;
    width: 100%;

    h1 {
      font-size: 32px;
      padding-top: 32px;
      word-break: break-word;
    }

    h1 + p {
      font-size: 20px;
      padding: 32px 20px;
    }

    .user {
      margin: 20px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .user-name {
        display: flex;
        align-items: center;

        span {
          font-size: 16px;
          margin-left: 6px;
        }

        img {
          width: 18px;
          height: 18px;
        }
      }

      .user-total {
        text-align: right;
        font-size: 16px;
      }
    }

    .container {
      user-select: none;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 0 3rem 0.5rem rgba(0, 0, 0, 0.24);
      border: 1px solid #e8eaed;

      img {
        border-radius: 16px;
        padding: 2px;
        overflow: hidden;
        min-width: 80px;
        max-width: 300px;
        max-height: 300px;
      }
    }
  }
}
</style>
