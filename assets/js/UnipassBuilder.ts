import PWCore, {
  Address,
  Amount,
  AmountUnit,
  Cell,
  RawTransaction,
  Transaction,
  Builder,
  Collector,
} from '@lay2/pw-core'
import { getUnipassCellDeps } from './unipass'

const UnipassWitnessArgs = {
  lock: '0x' + '0'.repeat(2082),
  input_type: '',
  output_type: '',
}

export default class UnipassBuilder extends Builder {
  constructor(
    private address: Address,
    private amount: Amount,
    feeRate?: number,
    collector?: Collector,
  ) {
    super(feeRate, collector)
  }

  async build(fee: Amount = Amount.ZERO): Promise<Transaction> {
    const outputCell = new Cell(this.amount, this.address.toLockScript())
    const neededAmount = this.amount.add(Builder.MIN_CHANGE).add(fee)
    let inputSum = new Amount('0')
    const inputCells: Cell[] = []

    // fill the inputs
    const cells = await this.collector.collect(PWCore.provider.address, {
      neededAmount,
    })
    for (const cell of cells) {
      inputCells.push(cell)
      inputSum = inputSum.add(cell.capacity)
      if (inputSum.gt(neededAmount)) break
    }
    // console.log(inputSum)
    if (inputSum.lt(neededAmount)) {
      throw new Error(
        `input capacity not enough, need ${neededAmount.toString(
          AmountUnit.ckb,
        )}, got ${inputSum.toString(AmountUnit.ckb)}`,
      )
    }
    // console.log(inputSum.lt(neededAmount))
    const changeCell = new Cell(
      inputSum.sub(outputCell.capacity),
      PWCore.provider.address.toLockScript(),
    )
    const cellsDeps = await getUnipassCellDeps()
    // console.log('cellsDeps', cellsDeps)
    const tx = new Transaction(
      new RawTransaction(inputCells, [outputCell, changeCell], cellsDeps),
      [UnipassWitnessArgs],
    )
    this.fee = Builder.calcFee(tx, this.feeRate)
    // console.log('fee', this.fee)
    if (changeCell.capacity.gte(Builder.MIN_CHANGE.add(this.fee))) {
      changeCell.capacity = changeCell.capacity.sub(this.fee)
      tx.raw.outputs.pop()
      tx.raw.outputs.push(changeCell)
      return tx
    }
    return this.build(this.fee)
  }

  getCollector() {
    return this.collector
  }
}
