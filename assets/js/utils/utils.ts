import {
  Blake2bHasher,
  getDefaultPrefix,
  HashType,
  Script,
} from '@lay2/pw-core'

/**
 * get ckb address by pubkey
 * @param pubkey
 */
export function getAddressByPubkey(pubkey: string): string {
  const pubKeyBuffer = Buffer.from(pubkey.replace('0x', ''), 'hex')
  const hashHex = new Blake2bHasher()
    .update(pubKeyBuffer.buffer)
    .digest()
    .serializeJson()
    .slice(0, 42)
  const script = new Script(
    process.env.UNIPASS_TYPE_ID as string,
    hashHex,
    HashType.type,
  )
  const address = script.toAddress(getDefaultPrefix()).toCKBAddress()
  return address
}
