import {
  AddressPrefix,
  AddressType,
  fullPayloadToAddress,
} from '@nervosnetwork/ckb-sdk-utils'
// import { CKBHasher } from './crypto'
const blake2b = require('blake2b')
const buf2hex = function (buffer: ArrayBufferLike) {
  // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('')
}
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
