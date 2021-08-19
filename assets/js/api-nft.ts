// eslint-disable-next-line
import gql from 'graphql-tag'
import { ApolloClient, DefaultOptions } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
}

const apolloClient = new ApolloClient({
  link: createHttpLink({
    uri: process.env.NFT_API_URL,
    fetch: fetch as any,
  }),
  cache: new InMemoryCache(),
  defaultOptions,
})
interface Assets {
  outPoint: {
    txHash: string
    index: string
  }
  txState: string
  nftTypeArgs: string
  classTypeArgs: string
  total: number
  issued: number
  name: string
  description: string
  renderer: string
  issuerName: string
  issuerAvatarUrl: string
  tokenId: number
  txHash?: string
  shortkey?: string
}
interface AssetsReqData {
  data: {
    getNFTAssetData: {
      asset: Assets[]
      history: Assets[]
    }
  }
}
interface AssetsQuery {
  address: String
  page: Number
  limit: Number
}

export async function getAssets({ address, limit, page }: AssetsQuery) {
  const gcbai = {
    address,
    limit,
    page,
  }
  try {
    const res = await apolloClient.query({
      query: gql`
        query getNFTAssetData($gcbai: GetCellByAddressInput!) {
          getNFTAssetData(getCellByAddressInput: $gcbai) {
            asset {
              name
              outPoint {
                txHash
                index
              }
              txState
              description
              renderer
              issuerName
              issuerAvatarUrl
              classTypeArgs
              nftTypeArgs
              tokenId
              issued
              total
            }
            history {
              txState
              txHash
              nftTypeArgs
              classTypeArgs
              total
              issued
              name
              description
              renderer
              issuerName
              issuerAvatarUrl
              tokenId
            }
          }
        }
      `,
      variables: { gcbai },
    })
    const data = res.data.getNFTAssetData as AssetsReqData
    return { ok: true, data }
  } catch (err) {
    return { ok: false, err }
  }
}
