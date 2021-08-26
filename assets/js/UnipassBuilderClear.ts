import PWCore, {
  Builder,
  Transaction,
  Cell,
  RawTransaction,
  Address,
  Amount,
  AmountUnit,
} from '@lay2/pw-core'
import { getUnipassCellDeps } from './unipass'

export default class UnipassBuilderClear extends Builder {
  constructor(public address: Address, feeRate?: number) {
    super(feeRate)
  }

  async build(): Promise<Transaction> {
    const balance = await PWCore.defaultCollector.getBalance(
      PWCore.provider.address,
    )
    console.log(PWCore.provider.address)
    const outputCell = new Cell(balance, this.address.toLockScript())

    const inputCells = await PWCore.defaultCollector.collect(
      PWCore.provider.address,
      { neededAmount: outputCell.capacity },
    )
    const cellDeps = await getUnipassCellDeps()
    const cellDep = [PWCore.config.defaultLock.cellDep].concat(cellDeps)

    const tx = new Transaction(
      new RawTransaction(inputCells, [outputCell], cellDeps),
      [Builder.WITNESS_ARGS.Secp256k1],
    )

    this.fee = Builder.calcFee(tx).add(new Amount('1000', AmountUnit.shannon))

    if (balance.lt(this.fee.add(Builder.MIN_CHANGE))) {
      throw new Error('Capacity is too small to send.')
    }

    tx.raw.outputs[0].capacity = outputCell.capacity.sub(this.fee)

    return tx
  }
}
