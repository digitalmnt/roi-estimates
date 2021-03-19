import { DeFiSDK } from 'defi-sdk'
const axios = require('axios').default

export async function defiSdk() {
  const nodeUrl = 'https://eth-mainnet.zerion.io/'
  return new DeFiSDK(nodeUrl)
}

const TIMEOUT = 30000
// const HEADERS = {
//   "Content-Type": "application/json;charset=utf-8",
//   Accept: "*/*",
// }
const HOST = 'https://api.zapper.fi/v1/'

const instance = axios.create({
  baseURL: HOST,
  timeout: TIMEOUT,
});

export async function fetchZapSwapData(
  ownerAddress: string,
  sellAmount: string,
  sellTokenAddress: string,
  poolAddress: string,
  gasPrice: string, 
  slippagePercentage: number,
): Promise<any> {
  const params = {
    api_key: process.env.REACT_APP_ZAP_API_KEY,
    ownerAddress: toLow(ownerAddress),
    sellAmount,
    sellTokenAddress: toLow(sellTokenAddress),
    poolAddress: toLow(poolAddress),
    gasPrice,
    slippagePercentage,
  }
  const swapData = await instance.get('zap-in/sushiswap/transaction', {
    params,
  })

  return swapData
}

export function fromBigNumber(balance: number, decimals: number = 18) {
  return balance / 10**decimals
}

export function toBigNumber(balance: number, decimals: number = 18) {
  return balance * 10**decimals
}

export const ethAddress = '0x0000000000000000000000000000000000000000'

export async function fetchGasPrices(): Promise<any> {
  const params = {
    api_key: process.env.REACT_APP_ZAP_API_KEY,
  }
  const gas = await instance.get('gas-price', {
    params
  })
  
  return gas.data
}

export function toLow(string: string) {
  return string.toLowerCase()
}