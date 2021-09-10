# nuxt

## set up npm Mirror source

View current

```
yarn config get registry
```

Default

```
yarn config set registry https://registry.yarnpkg.com
```

Tencent npm registry

```
npm config set registry https://mirrors.tencent.com/npm/
npm install nrm -g; nrm add tencent https://mirrors.tencent.com/npm/; nrm use tencent;
```

## End of line sequence

First [course](https://juejin.cn/post/6844904069304156168)

```
git config --global core.autocrlf false
```

Re clone the project

## Build Setup

```bash
# Installation dependency
$ yarn install

# Start service localhost:3000
$ yarn start

# build for production and launch server
$ yarn build
$ yarn preview

# Static packaging
$ yarn generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
