import { CellDep } from '@lay2/pw-core'
import axios from 'axios'

interface CellDepApi {
  data: CellDep[]
  code: number
}

export async function getUnipassCellDeps(): Promise<CellDep[]> {
  const url = process.env.CELL_DEPS_API as string
  const params = [
    {
      codeHash: process.env.UNIPASS_TYPE_ID,
      hashType: 'type',
      args: '0x',
    },
  ]
  const ret = await axios.post(url, params)
  const data = ret.data as CellDepApi
  return data.data
}
