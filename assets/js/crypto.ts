import forge from 'node-forge'
const blake2b = require('blake2b')

const base64ToUint8Array = function (base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
const arrayBufferToBase64 = function (buffer: ArrayBuffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  let data = window.btoa(binary)
  data = data + '='
  return data
}
const ab2str = function (buf: ArrayBuffer) {
  return String.fromCharCode.apply(null, Array.from(new Uint8Array(buf)))
}
const str2ab = function (str: string) {
  const b = new ArrayBuffer(str.length)
  const view = new Uint8Array(b)
  for (let i = 0; i < str.length; ++i) {
    view[i] = str.charCodeAt(i)
  }
  return b
}
const buf2hex = function (buffer: ArrayBufferLike) {
  // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('')
}
// export
export class CKBHasher {
  hasher: any
  constructor() {
    this.hasher = blake2b(
      32,
      null,
      null,
      new TextEncoder().encode('ckb-default-hash'),
    )
  }

  update(data: any) {
    let dataArray

    if (data instanceof Uint8Array) {
      dataArray = data
    } else {
      dataArray = new TextEncoder().encode(data)
    }
    this.hasher.update(dataArray)
    return this
  }

  digest() {
    const out = new Uint8Array(32)
    this.hasher.digest(out)
    return out.buffer
  }

  digestHex() {
    return `0x${buf2hex(this.digest())}`
  }
}
/**
 *
 * @param email used as salt
 * @param password optional, if provided, the key will be exported as an encrypted pem;
 * else the key will be unextractable
 * @returns the cryptoKey object, the pubkey hex string, and the pem (can be null)
 */
export async function generateKey(salt: string, password?: string) {
  // create RSA key
  const key = await window.crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: 'SHA-256' },
    },
    !!password,
    ['sign', 'verify'],
  )

  // get public key
  const pubkeyJWK = await window.crypto.subtle.exportKey('jwk', key.publicKey)
  if (!pubkeyJWK.e || !pubkeyJWK.n) {
    throw new Error('pubkey generation failed')
  }

  const nA = Buffer.from(pubkeyJWK.n, 'base64').reverse()
  const eA = Buffer.alloc(4)
  const sA = Buffer.alloc(4)
  eA.writeUInt32LE(65537, 0)
  sA.writeUInt32LE(nA.length * 8, 0)

  const pubkey = Buffer.concat([sA, eA, nA]).toString('hex')

  let pem: string | null = null
  if (password) {
    // generate pem from private key
    let pkcs8: ArrayBuffer | null = await window.crypto.subtle.exportKey(
      'pkcs8',
      key.privateKey,
    )
    const exportedAsString = ab2str(pkcs8)
    const exportedAsBase64 = window.btoa(exportedAsString)
    const pemExported = `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64}\n-----END PRIVATE KEY-----`
    pkcs8 = null

    // encrypt key with password
    // const start = new Date().getTime();
    const strongPass = forge.pkcs5.pbkdf2(password, salt, 2 ** 16, 16)
    // const end = new Date().getTime();
    // alert(`[kdf time] ${(end - start) / 1000}`);

    const rsaKey = forge.pki.privateKeyFromPem(pemExported)
    pem = forge.pki.encryptRsaPrivateKey(rsaKey, strongPass, {
      algorithm: 'aes256',
    })
  }

  return { key, pubkey, pem }
}
export async function authorize(
  pubkey: string,
  masterKey: CryptoKey | string,
  salt: string,
  password: string,
) {
  if (typeof masterKey === 'string') {
    masterKey = await decryptMasterKey(password, salt, masterKey)
  }

  const sig = await window.crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    masterKey,
    // new TextEncoder().encode(pubkey)
    Buffer.from(pubkey.replace('0x', ''), 'hex').buffer,
  )

  return Buffer.from(sig).toString('hex')
}
export async function decryptMasterKey(
  password: string,
  salt: string,
  masterKey: string,
): Promise<CryptoKey> {
  const strongPass = forge.pkcs5.pbkdf2(password, salt, 2 ** 16, 16)
  const privkey = forge.pki.decryptRsaPrivateKey(masterKey, strongPass)

  // convert to pkcs8 format pem, refer to https://github.com/digitalbazaar/forge/issues/109#issuecomment-38009619
  const rsaPrivateKey = forge.pki.privateKeyToAsn1(privkey)
  const privateKeyInfo = forge.pki.wrapRsaPrivateKey(rsaPrivateKey)
  const pem = forge.pki
    .privateKeyInfoToPem(privateKeyInfo)
    .replace(/\r/g, '')
    .replace(/\n/g, '')

  // // converts a forge 0.6.x string of bytes to an ArrayBuffer
  const pemHeader = '-----BEGIN PRIVATE KEY-----'
  const pemFooter = '-----END PRIVATE KEY-----'
  const pemContents = pem.substring(
    pemHeader.length,
    pem.length - pemFooter.length,
  )
  // base64 decode the string to get the binary data
  const binaryDerString = window.atob(pemContents)
  // convert from a binary string to an ArrayBuffer
  const binaryDer = str2ab(binaryDerString)

  return await window.crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign'],
  )
}
/**
 * sign email recovery data for user.
 * recovery data sig = rsakey.sign(blake2b_hash(email.length, email, passwd.length, passowrd))
 *
 * @param key user's master private key
 * @param email user's email address
 * @param passwd user's password for recovery data, default: 123456
 * @returns signature for recovery data.
 */
export async function signRecoveryData(
  key: CryptoKey,
  email: string,
  passwd = '123456',
) {
  const hasher = new CKBHasher()

  const buffer1 = Buffer.alloc(8)
  buffer1.writeUInt32LE(email.length, 0)
  hasher.update(new Uint8Array(buffer1.buffer))
  hasher.update(email)

  const buffer2 = Buffer.alloc(8)
  buffer2.writeUInt32LE(passwd.length, 0)
  hasher.update(new Uint8Array(buffer2.buffer))
  hasher.update(passwd)

  const hash = hasher.digestHex()
  const sig = await signMessage(key, hash)
  return sig
}
export async function signMessage(key: CryptoKey, msg: string) {
  const sig = await window.crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    // new TextEncoder().encode(msg)
    Buffer.from(msg.replace('0x', ''), 'hex').buffer,
  )
  return Buffer.from(sig).toString('hex')
}
export async function importSecretKey(pin: string) {
  const pwUtf8 = new TextEncoder().encode(pin)
  const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8)
  const key = await crypto.subtle.importKey('raw', pwHash, 'AES-GCM', false, [
    'decrypt',
    'encrypt',
  ])
  return key
}
export async function encryptPinData(data: string, pin: string) {
  const encoded = new TextEncoder().encode(data)
  const key = await importSecretKey(pin)
  const iv = new TextEncoder().encode(pin)
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encoded,
  )
  return arrayBufferToBase64(ciphertext)
}
export async function decryptPinData(data: string, pin: string) {
  data = data.slice(0, -1)
  const decrypt = base64ToUint8Array(data)
  const iv = new TextEncoder().encode(pin)
  const key = await importSecretKey(pin)
  const ciphertext = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    decrypt,
  )
  const plaintext = new TextDecoder().decode(ciphertext)
  const ok = plaintext.startsWith(pin)
  if (ok) {
    const authorization = plaintext.split(pin)[1]
    return authorization
  } else {
    return ''
  }
}
