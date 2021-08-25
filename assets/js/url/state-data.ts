import { Address, AddressType } from '@lay2/pw-core'
import { getAddress } from '../unipass'
import {
  ActionType,
  PageData,
  PAGESTATE,
  PageState,
  PROVIDER,
  UnipassURLData,
} from './interface'
function saveData(key: string, data: string) {
  window.localStorage.setItem(key, data)
}

function getData(key: string): string {
  return window.localStorage.getItem(key) as string
}

function removeData(key: string) {
  window.localStorage.removeItem(key)
}

export function saveState(action: ActionType, extraObj = '', data?: PageData) {
  let pageState = JSON.parse(getData(PAGESTATE)) as PageState
  if (pageState) {
    pageState.action = action
    pageState.extraObj = extraObj
    if (!pageState.data.pubkey) {
      pageState.data = {
        signature: '',
        pubkey: '',
      }
    }
  } else {
    if (!data) {
      data = {
        signature: '',
        pubkey: '',
      }
    }
    pageState = {
      action,
      extraObj,
      data,
    }
  }

  // save local store
  saveData(PAGESTATE, JSON.stringify(pageState))
}

export function restoreState(sign: boolean): PageState | undefined {
  const pageState = JSON.parse(getData(PAGESTATE)) as PageState
  if (!pageState) return undefined
  if (!sign) removeData(PAGESTATE)
  return pageState
}

export function getPubkey(): string | undefined {
  const provider = JSON.parse(getData(PROVIDER))
  if (!provider) return undefined
  return provider._pubkey
}

export function getDataFromUrl(action: number) {
  const url = new URL(window.location.href)
  let info = ''
  let data = ''
  try {
    data = url.searchParams.get('unipass_ret') as string
  } catch (e) {
    return info
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const unipassStr = encodeURIComponent(data)

  const unipassData = JSON.parse(unipassStr) as UnipassURLData

  if (!unipassData) return info
  console.log(unipassData)

  if (unipassData.code === 200) {
    if (unipassData.data.pubkey) {
      const ckbAddress = getAddress(unipassData.data.pubkey)
      let pageState = JSON.parse(getData(PAGESTATE)) as PageState
      if (pageState) {
        pageState.data.signature = unipassData.data.sig as string
        pageState.data.pubkey = unipassData.data.pubkey as string
      } else {
        pageState = {
          action,
          extraObj: '',
          data: {
            signature: '',
            pubkey: '',
          },
        }
      }
      console.log('[==pageState]', pageState)
      saveData(PAGESTATE, JSON.stringify(pageState))

      const provider = {
        _time: Date.now(),
        _address: new Address(ckbAddress, AddressType.ckb),
        _email: unipassData.data.email,
        _pubkey: unipassData.data.pubkey,
      }
      if (action === ActionType.Init || action === ActionType.Login) {
        saveData(PROVIDER, JSON.stringify(provider))
      }
    }
  } else {
    info = unipassData.info
  }
  url.searchParams.delete('unipass_ret')
  history.replaceState('', '', url.href)
  console.log('url.href', url.href)
  return info
}
export function generateUnipassUrl(
  host: string,
  action: string,
  params: { [key: string]: string },
) {
  const urlObj = new URL(`${host}/${action.toLowerCase()}`)
  for (const key of Object.keys(params)) {
    urlObj.searchParams.set(key, params[key])
  }
  return urlObj.href
}
