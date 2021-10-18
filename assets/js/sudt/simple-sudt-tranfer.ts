import PWCore, {
  Address,
  Amount,
  AmountUnit,
  BuilderOption,
  SUDT,
  transformers,
} from '@lay2/pw-core'
import { getUnipassCellDeps } from '../unipass'
import UnipassSigner from '../UnipassSigner'
import { SimpleSUDTBuilder } from './simple-sudt-builder'
import { UsdtProvider } from './sudt-provider'
import { UnipassIndexerCollector } from './unipass-indexer-collector'

export async function getBalanceEnough() {
  const balance = await PWCore.defaultCollector.getBalance(
    PWCore.provider.address,
  )
  return balance.gt(new Amount('204', AmountUnit.ckb))
}

export async function getSimpleUSDTSignMessage(
  sudtTokenId: string,
  address: Address,
  amount: Amount,
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

  const sudt = new SUDT(sudtTokenId)

  const builder = new SimpleSUDTBuilder(
    sudt,
    address,
    amount,
    cellDeps,
    builderOption,
  )
  console.log('builder', builder)
  const tx = await builder.build()
  console.log('tx', tx)
  const signer = new UnipassSigner(provider)
  console.log('signer', signer)
  const messages = signer.toMessages(tx)
  console.log('[getUsdtSignMessage-messages]', messages)
  const txObj = transformers.TransformTransaction(tx)
  const message = messages[0].message
  return { tx, txObj, message }
}
