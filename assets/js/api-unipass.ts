// eslint-disable-next-line
import gql from 'graphql-tag'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import fetch from 'node-fetch'
import MobileDetect from 'mobile-detect'

const apolloClient = new ApolloClient({
  link: createHttpLink({
    // @ts-ignore
    uri: process.env.UNIPASS_API_URL,
    fetch: fetch as any,
  }),
  cache: new InMemoryCache(),
})
const mobileInfo = () => {
  const deviceType = navigator.userAgent
  const md = new MobileDetect(deviceType)
  let os = md.os()
  let version
  let model = md.mobile()
  if (os === 'iOS') {
    version = md.version('iPhone')
    model = md.mobile()
  } else if (os === 'AndroidOS') {
    version = md.version('AndroidOS')
    const info = deviceType.split(';')
    if (info.length > 2) {
      version = info[1].trim()
      model = info[2].split('Build/')[0].trim()
    }
  } else if (os === 'WindowsPhoneOS') {
    version = md.version('WindowsPhoneOS')
  } else {
    os = 'pc'
    const info = deviceType.split(' ')
    if (info.length > 2) {
      model = info[3] + info[4] + '_' + info[6].split('_').join('.')
    }
  }
  let from = 'Chrome'
  if (deviceType.includes('MSIE')) {
    from = 'IE/' + deviceType.split('MSIE/')[1].split(' ')[0]
  } else if (deviceType.includes('MicroMessenger')) {
    from = 'WeChat/' + deviceType.split('MicroMessenger/')[1].split(' ')[0]
  } else if (deviceType.includes('Firefox')) {
    from = 'Firefox/' + deviceType.split('Firefox/')[1].split(' ')[0]
  } else if (deviceType.includes('Chrome')) {
    from = 'Chrome/' + deviceType.split('Chrome/')[1].split(' ')[0]
  } else if (deviceType.includes('QQBrowserLite')) {
    from = 'QQBrowser/' + deviceType.split('QQBrowserLite/')[1].split(' ')[0]
  } else if (deviceType.includes('Opera')) {
    from = 'Opera/' + deviceType.split('Opera/')[1].split(' ')[0]
  } else if (deviceType.includes('Safari')) {
    from = 'Safari/' + deviceType.split('Safari/')[1].split(' ')[0]
  } else if (deviceType.includes('Netscape')) {
    from = 'Netscape/' + deviceType.split('Netscape/')[1].split(' ')[0]
  }
  const deviceInfo = [version, from, model, os]
  const info = {
    os,
    version,
    model,
    from,
    deviceInfo,
  }
  return info
}
export async function queryAccount(
  idpass: string,
  email: string,
  phone: string,
  masterKey: boolean,
) {
  let query = gql`
    query queryAccount($qa: QueryAccountInput!) {
      account(queryAccountInput: $qa) {
        email
        phone
        masterPubkeyHash
        masterPubkeySize
        masterPubkeyBin
        masterKeystore
        recoveryData
        status
      }
    }
  `
  if (masterKey) {
    query = gql`
      query queryAccount($qa: QueryAccountInput!) {
        account(queryAccountInput: $qa) {
          email
          phone
          status
        }
      }
    `
  }
  try {
    const res = await apolloClient.query({
      query,
      variables: {
        qa: {
          email,
          phone,
          hPasswd: idpass,
        },
      },
    })
    return { ok: true, data: res.data }
  } catch (err) {
    let msg = 'warning'
    if (err.message.includes('recovering')) {
      msg = 'recovering'
    }
    return { ok: false, msg }
  }
}
export async function createLocalKey(
  masterPubkeyHash: string,
  localPubkey: string,
  authorization: string,
  error?: string,
) {
  const info = mobileInfo()
  try {
    await apolloClient.mutate({
      mutation: gql`
        mutation createLocalKey($clki: CreateLocalKeyInput!) {
          createLocalKey(createLocalKeyInput: $clki) {
            accountId
            platform
            deviceInfo
            localPubkeyHash
            authorization
          }
        }
      `,
      variables: {
        clki: {
          masterPubkeyHash,
          platform: info.os,
          deviceInfo: info.deviceInfo.join('-'),
          localPubkey,
          authorization,
        },
      },
    })
  } catch (e) {
    if (error) {
      console.log('error', error)
    }
    return false
  }
}
export async function requestOtpCode(
  action: string,
  email?: string,
  phone?: string,
) {
  const roc = {
    action,
    email,
    phone,
  }
  try {
    const data = await apolloClient.mutate({
      mutation: gql`
        mutation requestOtpCode($roc: RequestOtpCodeInput!) {
          requestOtpCode(requestOtpCodeInput: $roc) {
            otpToken
          }
        }
      `,
      variables: { roc },
    })
    return {
      ok: true,
      data,
    }
  } catch (err) {
    return {
      ok: false,
      err,
    }
  }
}
export async function verifyOtpCode(
  action: string,
  code: string,
  email?: string,
  phone?: string,
) {
  const voc = {
    email,
    action,
    code,
    phone,
  }
  try {
    const res = await apolloClient.mutate({
      mutation: gql`
        mutation verifyOtpCode($voc: VerifyOtpCodeInput!) {
          verifyOtpCode(verifyOtpCodeInput: $voc) {
            otpToken
          }
        }
      `,
      variables: { voc },
    })
    return {
      ok: true,
      token: res.data.verifyOtpCode?.otpToken,
    }
  } catch (err) {
    return {
      ok: false,
      err,
    }
  }
}
export async function createAccount(
  idpass: string,
  masterPubkey: string,
  masterKeystore: string,
  otpToken: string,
  email?: string,
  phone?: string,
) {
  const ca = {
    email,
    hPasswd: idpass,
    masterPubkey,
    masterKeystore,
    otpToken,
    phone,
  }
  try {
    const res = await apolloClient.mutate({
      mutation: gql`
        mutation createAccount($ca: CreateAccountInput!) {
          createAccount(createAccountInput: $ca) {
            email
            phone
            masterPubkeyHash
            recoveryData
          }
        }
      `,
      variables: { ca },
    })
    const masterPubkeyHash = res.data.createAccount?.masterPubkeyHash
    if (masterPubkeyHash) {
      return {
        ok: true,
        masterPubkeyHash,
      }
    } else {
      return {
        ok: false,
        data: res.data,
      }
    }
  } catch (err) {
    return {
      ok: false,
      err,
    }
  }
}
export async function uploadRecoveryData(
  email: string,
  hPasswd: string,
  recoveryData: string,
) {
  const urd = {
    email,
    hPasswd,
    recoveryData, // master 的 privearekey 签邮箱
  }
  try {
    const res = await apolloClient.mutate({
      mutation: gql`
        mutation uploadRecoveryData($urd: UploadRecoveryDataInput!) {
          uploadRecoveryData(uploadRecoveryDataInput: $urd) {
            email
            recoveryData
          }
        }
      `,
      variables: { urd },
    })
    return {
      ok: true,
      data: res.data,
    }
  } catch (err) {
    return {
      ok: false,
      err,
    }
  }
}
export async function forgotPassword(
  code: string,
  email?: string,
  phone?: string,
) {
  const fpi = {
    action: 'forgotPassword',
    email,
    phone,
    code,
  }
  try {
    const res = await apolloClient.mutate({
      mutation: gql`
        mutation forgotPassword($fpi: VerifyOtpCodeInput!) {
          forgotPassword(forgotPasswordInput: $fpi) {
            hasAsset
            hasEmail
            otpToken
            email
            phone
            status
          }
        }
      `,
      variables: { fpi },
    })
    return {
      ok: true,
      ret: res.data.forgotPassword,
    }
  } catch (err) {
    return {
      ok: false,
      err,
    }
  }
}
export async function replaceAccount(
  otpToken: string,
  hPasswd: string,
  masterPubkey: string,
  masterKeystore: string,
  email?: string,
  phone?: string,
) {
  const rai = {
    email,
    phone,
    hPasswd,
    masterPubkey,
    masterKeystore,
    otpToken,
  }
  try {
    const res = await apolloClient.mutate({
      mutation: gql`
        mutation replaceAccount($rai: CreateAccountInput!) {
          replaceAccount(replaceAccountInput: $rai) {
            email
            phone
          }
        }
      `,
      variables: { rai },
    })
    return {
      ok: true,
      data: res.data,
      replaceAccount: res.data.replaceAccount,
    }
  } catch (err) {
    return {
      ok: false,
      err,
    }
  }
}
export async function createTempAccount(
  idpass: string,
  masterPubkey: string,
  masterKeystore: string,
  otpToken: string,
  recoveryData: string,
  email?: string,
  phone?: string,
) {
  const tai = {
    email,
    hPasswd: idpass,
    masterPubkey,
    masterKeystore,
    otpToken,
    phone,
    recoveryData,
  }
  try {
    const data = await apolloClient.mutate({
      mutation: gql`
        mutation tempAccount($tai: TempAccountInput!) {
          tempAccount(tempAccount: $tai) {
            email
            phone
          }
        }
      `,
      variables: { tai },
    })
    return {
      ok: true,
      data,
    }
  } catch (err) {
    return {
      ok: false,
      err,
    }
  }
}
export async function getCkbAddress(pubkey?: string, email?: string) {
  const qai = {
    pubkey,
    email,
  }
  try {
    const res = await apolloClient.mutate({
      mutation: gql`
        query queryAddress($qai: QueryAddressInput!) {
          queryAddress(queryAddressInput: $qai) {
            address
          }
        }
      `,
      variables: { qai },
    })
    return res.data.queryAddress.address
  } catch (err) {
    return ''
  }
}
export async function getMails() {
  try {
    const res = await apolloClient.query({
      query: gql`
        query getConfig {
          getConfig {
            mailServices
          }
        }
      `,
    })
    const mails = res.data.getConfig?.mailServices
    return mails
  } catch (e) {
    return false
  }
}
