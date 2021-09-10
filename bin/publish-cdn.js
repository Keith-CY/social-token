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
  // Regional node
  region: process.env.OSS_REGION,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET,
})
// Upload file: src = Local path: dist = Cloud path
let success = 0
const uploadFile = (src, dist, doc) => {
  client
    .put(dist, src)
    .then((res) => {
      success += 1
      console.log('Upload succeeded', res.name)
    })
    .catch(() => {
      if (success > 1) {
        console.log('Upload failed, upload again', doc)
        uploadFile(src, dist)
      } else {
        console.log('Upload failed', doc)
      }
    })
}
// Upload directory: src = Local path, dist Cloud directory
const uploadDirectory = (src, dist) => {
  if (fs.existsSync(src) === false) {
    console.log('Please pack dist first')
    return
  }
  const docs = fs.readdirSync(src)
  for (const doc of docs) {
    const _src = src + '/' + doc
    const _dist = dist + '/' + doc
    const st = fs.statSync(_src)
    // Determine whether it is a file
    if (st.isFile() && !['.DS_Store', '.nojekyll'].includes(doc)) {
      uploadFile(_src, _dist, doc)
    } else if (st.isDirectory()) {
      // If it is a directory, call itself recursively
      uploadDirectory(_src, _dist)
    }
  }
}
// https://help.aliyun.com/document_detail/111408.htm?spm=a2c4g.11186623.2.15.61937ff0oYacAG
// Delete file
const deleteFile = async (name) => {
  try {
    await client.delete(name)
    return name
  } catch (error) {
    error.failObjectName = name
    return error
  }
}
// Delete directory
// eslint-disable-next-line
const deleteDirectory = async (prefix) => {
  const list = await client.list({
    prefix,
  })

  list.objects = list.objects || []
  const result = await Promise.all(list.objects.map((v) => deleteFile(v.name)))
  console.log('Delete complete', result)
}

// eslint-disable-next-line
const main = async () => {
  // delete
  // await deleteDirectory(process.env.OSS_PATH)
  // upload
  uploadDirectory(process.cwd() + '/dist', process.env.OSS_PATH)
}
main()
