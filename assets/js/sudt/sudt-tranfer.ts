import {
  Address,
  AddressType,
  Amount,
  AmountUnit,
  BuilderOption,
  normalizers,
  Reader,
  RPC,
  SerializeWitnessArgs,
  SUDT,
  transformers,
  WitnessArgs,
} from '@lay2/pw-core'
import { getUnipassCellDeps } from '../unipass'
import UnipassSigner from '../UnipassSigner'
import { SUDTBuilder } from './sudt-builder'
import { UsdtProvider } from './sudt-provider'
import { UnipassIndexerCollector } from './unipass-indexer-collector'

export async function getUSDTSignMessage(
  sudtTokenId: string,
  toAddress: string,
  toAmount: string,
  masterPubkey: string,
) {
  const provider = new UsdtProvider(masterPubkey)
  const usdtAddress = provider.address
  console.log('usdtAddress', usdtAddress.addressString)

  const cellDeps = await getUnipassCellDeps()
  const lockLen = (1 + (8 + 256 * 2) * 2) * 2
  const collector = new UnipassIndexerCollector(
    process.env.CKB_INDEXER_URL as string,
  )

  const builderOption: BuilderOption = {
    witnessArgs: {
      lock: '0x' + '0'.repeat(lockLen),
      input_type: '',
      output_type: '',
    },
    collector,
  }

  const address = new Address(toAddress, AddressType.ckb)
  const amount = new Amount(toAmount, AmountUnit.shannon)
  const sudt = new SUDT(sudtTokenId)

  const builder = new SUDTBuilder(
    sudt,
    address,
    amount,
    cellDeps,
    builderOption,
  )
  // console.log('builder', builder)
  const tx = await builder.build()
  // console.log('tx', tx)
  const signer = new UnipassSigner(provider)
  // console.log('signer', signer)
  const messages = signer.toMessages(tx)
  // console.log('[getUsdtSignMessage-messages]', messages)
  const txObj = transformers.TransformTransaction(tx)
  const message = messages[0].message
  return { txObj, message }
}

export async function getSUDTSignCallback(sig: string, txObj: any) {
  // console.log('getTakerSignCallback-sig', sig)
  // console.log('getTakerSignCallback-txObj', txObj)
  const witnessArgs: WitnessArgs = {
    lock: '0x01' + sig.replace('0x', ''),
    input_type: '',
    output_type: '',
  }
  const witness = new Reader(
    SerializeWitnessArgs(normalizers.NormalizeWitnessArgs(witnessArgs)),
  ).serializeJson()
  txObj.witnesses[0] = witness

  const transformedTx = await transformers.TransformTransaction(txObj)
  // console.log('transformedTx', JSON.stringify(transformedTx))
  const rpc = new RPC(process.env.CKB_NODE_URL as string)
  try {
    const txhash = await rpc.send_transaction(transformedTx)
    return txhash
  } catch (e) {
    console.log(e)
    return false
  }
}
