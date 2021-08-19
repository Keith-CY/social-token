// https://blog.csdn.net/zuggs_/article/details/84768489
const fs = require('fs')
const OSS = require('ali-oss')
const dotenv = require('dotenv')
dotenv.config()

console.log('KEY', process.env.OSS_ACCESS_KEY_ID)
console.log('SECRET', process.env.OSS_ACCESS_KEY_SECRET)
console.log('BUCKET', process.env.OSS_BUCKET)
console.log('PATH', process.env.OSS_PATH)

const client = new OSS({
  // 地域节点
  region: process.env.OSS_REGION,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  // 域名
  bucket: process.env.OSS_BUCKET,
})
// 上传文件 src = 本地路径 dist = 云端路径
const uploadFile = (src, dist) => {
  client
    .put(dist, src)
    .then((res) => {
      console.log('上传成功', res.name)
    })
    .catch(() => {
      console.log('上传失败', src)
    })
}
// 上传目录 src = 本地路径, dist 云端目录
const uploaDirectory = (src, dist) => {
  if (fs.existsSync(src) === false) {
    console.log('请先打包 dist')
    return
  }
  const docs = fs.readdirSync(src)
  for (const doc of docs) {
    const _src = src + '/' + doc
    const _dist = dist + '/' + doc
    const st = fs.statSync(_src)
    // 判断是否为文件
    if (st.isFile() && !['.DS_Store', '.nojekyll'].includes(doc)) {
      uploadFile(_src, _dist)
    } else if (st.isDirectory()) {
      // 如果是目录则递归调用自身
      uploaDirectory(_src, _dist)
    }
  }
}
// https://help.aliyun.com/document_detail/111408.htm?spm=a2c4g.11186623.2.15.61937ff0oYacAG
// 删除文件
const deleteFile = async (name) => {
  try {
    await client.delete(name)
    return name
  } catch (error) {
    error.failObjectName = name
    return error
  }
}
// 删除目录
// eslint-disable-next-line
const deleteDirectory = async (prefix) => {
  const list = await client.list({
    prefix,
  })

  list.objects = list.objects || []
  const result = await Promise.all(list.objects.map((v) => deleteFile(v.name)))
  console.log('删除完成', result)
}

// eslint-disable-next-line
const main = async () => {
  // 删除
  // await deleteDirectory(process.env.OSS_PATH)
  // 上传
  uploaDirectory(process.cwd() + '/dist', process.env.OSS_PATH)
}
main()
