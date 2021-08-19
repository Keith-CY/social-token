import forge from 'node-forge'
import Dexie from 'dexie'
import {
  AddressPrefix,
  AddressType,
  fullPayloadToAddress,
} from '@nervosnetwork/ckb-sdk-utils'
import {
  authorize,
  generateKey,
  encryptPinData,
  decryptPinData,
  signMessage,
  signRecoveryData,
  CKBHasher,
} from './crypto'
import {
  queryAccount,
  createLocalKey,
  createAccount,
  uploadRecoveryData,
  replaceAccount,
  getCkbAddress,
  createTempAccount,
} from './api-unipass'

// db
const dbName = 'testDB3'
const dbTable = 'MyObjectStore'
const db = new Dexie(dbName)
db.version(1).stores({ MyObjectStore: 'id' })
// interface
export interface UniPassAccount {
  masterKey: string
  email?: string
  phone?: string
}
export interface User {
  account: UniPassAccount
  localKey?: {
    privateKey: CryptoKey
    publicKey: string
  }
  status: number
  authorization: string
  token?: string
  address?: string
  locked?: boolean
  recovery?: boolean
}
// utils
const getIdPass = (password: string) => {
  const hmac = forge.hmac.create()
  hmac.start('sha256', password)
  hmac.update('email')
  const idPass = hmac.digest().toHex()
  return idPass
}

const setAuthorization = async (
  masterKey: string,
  password: string,
  masterPubkeyHash: string,
  user: User,
) => {
  // generate local key, authorize with master key from pem, save them to local
  const { key, pubkey } = await generateKey('email')
  const authorization = await authorize(pubkey, masterKey, 'email', password)
  await createLocalKey(masterPubkeyHash, pubkey, authorization)
  // set auth
  user.authorization = authorization
  user.localKey = {
    privateKey: key.privateKey,
    publicKey: pubkey,
  }
}
// export
export const getAddress = (masterKey: string) => {
  const pubKeyArray = Buffer.from(masterKey.replace('0x', ''), 'hex')

  const hashHex = new CKBHasher()
    .update(new Uint8Array(pubKeyArray))
    .digestHex()
    .slice(0, 42)

  const address = fullPayloadToAddress({
    args: hashHex,
    prefix:
      process.env.CKB_CHAIN_ID === '0'
        ? AddressPrefix.Mainnet
        : AddressPrefix.Testnet,
    type: AddressType.TypeCodeHash,
    codeHash: process.env.UNIPASS_TYPE_ID!,
  })

  return address
}

export const isEmail = (email: string) => {
  const re = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
  const state = re.test(email.toLowerCase())
  return state
}
export const isPhone = (phone: string) => {
  const re = /^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/
  return re.test(phone)
}

// user
export async function getUser() {
  db.open()
  return await db.table(dbTable).get(1)
}
export async function setUser(user: User) {
  db.open()
  await db.table(dbTable).put({ ...user, id: 1 })
}
export async function login(account: string, password: string) {
  const idPass = getIdPass(password)
  let email = ''
  let phone = ''
  if (!isEmail(account) && isPhone(account)) {
    phone = account
  } else {
    email = account
  }
  const res = await queryAccount(idPass, email, phone, false)
  if (res.ok) {
    const user = {} as User
    const ret = res.data.account
    const masterKey = ret.masterPubkeyBin.replace('0x', '')
    user.account = {
      email: ret.email,
      phone: ret.phone,
      masterKey,
    }
    user.address = getAddress(masterKey)
    user.status = ret.status
    // todo recovery
    // user.recovery = recovery
    await setAuthorization(
      ret.masterKeystore,
      password,
      ret.masterPubkeyHash,
      user,
    )
    await setUser(user)
    res.data = user
  }
  return res
}
export async function logout() {
  await db.delete()
}
export async function register(email: string, password: string, user: User) {
  if (!(email && password)) {
    return { ok: false, msg: 'email or password is empty' }
  }
  let type = 'email'
  if (!isEmail(email) && isPhone(email)) {
    type = 'phone'
  }
  const { key, pubkey, pem } = await generateKey('email', password)
  if (!pem) {
    return {
      ok: false,
      msg: 'Master Key Generation Failed',
    }
  }
  const idPass = getIdPass(password)
  const token = user.token || ''
  let phone = ''
  if (type === 'phone') {
    phone = email
    email = ''
  }
  const res = await createAccount(idPass, pubkey, pem, token, email, phone)
  if (!res.ok) {
    return res
  }
  if (type !== 'phone') {
    const recoveryData = await signRecoveryData(key.privateKey, email)
    await uploadRecoveryData(email, idPass, recoveryData)
  }
  const account = {
    email,
    phone,
    masterKey: pubkey,
  }
  user.account = account
  return {
    ok: true,
    masterPubkey: pubkey,
    masterKey: key,
    masterPubkeyHash: res.masterPubkeyHash,
  }
}
export async function resetPassword(
  email: string,
  password: string,
  token: string,
) {
  const { key, pubkey, pem } = await generateKey('email', password)
  if (!pem) {
    return {
      ok: false,
      msg: 'Master Key Generation Failed',
    }
  }
  const idPass = getIdPass(password)
  const phone = ''
  const res = await replaceAccount(token, idPass, pubkey, pem, email, phone)
  if (res.ok) {
    const ret = res.replaceAccount
    if (ret.email) {
      const recoveryData = await signRecoveryData(key.privateKey, ret.email)
      await uploadRecoveryData(ret.email, idPass, recoveryData)
    }
    return { ok: true }
  } else {
    return res
  }
}

// pin
export async function setPin(pin: string, user: User) {
  const data = pin + user.authorization
  const authorization = await encryptPinData(data, pin)
  user.authorization = authorization
  await setUser(user)
}
export async function checkPin(pin: string, user: User) {
  try {
    await decryptPinData(user.authorization, pin)
    return true
  } catch (e) {
    return false
  }
}
export async function checkLogin(user: User, password: string) {
  const idPass = getIdPass(password)
  const { email, phone } = user.account
  const res = await queryAccount(
    idPass,
    email as string,
    phone as string,
    false,
  )
  return res
}
export async function forgetPin(pin: string, user: User, password: string) {
  const res = await checkLogin(user, password)
  if (res.ok) {
    const ret = res.data.account
    await setAuthorization(
      ret.masterKeystore,
      password,
      ret.masterPubkeyHash,
      user,
    )
    await setPin(pin, user)
    return true
  } else {
    return false
  }
}
// sign
export async function sign(pin: string, user: User, messageHash: string) {
  const auth = await decryptPinData(user.authorization, pin)
  const masterPubkey = user.account.masterKey
  const localPubkey = user.localKey?.publicKey as string
  const sig = await signMessage(
    user.localKey?.privateKey as CryptoKey,
    messageHash.replace('0x', ''),
  )
  const buffer = Buffer.concat([
    Buffer.from(masterPubkey.replace('0x', ''), 'hex'),
    Buffer.from(auth.replace('0x', ''), 'hex'),
    Buffer.from(localPubkey.replace('0x', ''), 'hex'),
    Buffer.from(sig.replace('0x', ''), 'hex'),
  ])
  return `0x${buffer.toString('hex')}`
}
// recover address
export async function ckbAddress(email: string, password: string) {
  let data = null
  if (password) {
    const { key, pubkey, pem } = await generateKey('email', password)
    const address = await getCkbAddress(pubkey, '')
    data = { address, pubkey, pem, key }
  } else if (email) {
    const address = await getCkbAddress('', email)
    data = { address, pubkey: '' }
  }
  return {
    ok: Boolean(data),
    data,
  }
}
export async function recoverTempAccount(
  password: string,
  email: string,
  token: string,
  phone: string,
  pubkey: string,
  pem: string,
  key: CryptoKeyPair,
) {
  const idPass = getIdPass(password)
  const recoveryData = await signRecoveryData(key.privateKey, email)
  const res = await createTempAccount(
    idPass,
    pubkey,
    pem,
    token,
    recoveryData,
    email,
    phone,
  )
  return res
}
