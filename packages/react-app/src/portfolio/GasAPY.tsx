import { JsonRpcSigner } from "@ethersproject/providers"
import { ResponsiveBullet } from '@nivo/bullet'
import sushiData from '@sushiswap/sushi-data'
import { Pool } from '@sushiswap/sushi-data/typings/masterchef'
import dayjs from 'dayjs'
import { BigNumber, utils } from 'ethers'
import React, { FC, useEffect, useState } from 'react'
import { Col, Row } from 'react-awesome-styled-grid'
import {
  Header2
} from '../components'
import {
  ethAddress,

  fetchGasPrices, fetchZapSwapData,
  toBigNumber
} from '../utilities'
import { GasAPYElement } from './GasAPYElement'



const CoinGecko = require('coingecko-api')
const CoinGeckoClient = new CoinGecko()

interface PoolData {
  '24h Volume': string,
  '30 Day ROI - IL': number,
  'Address': string,
  'Estimated Fees (30d)': string,
  'Estimated IL (30d)': string,
  'Estimated ROI (7d/30d/1y)': string,
  'Liquidity Pool': string,
  'Total Liquidity': string,
}

interface PoolProp {
  pool: PoolData,
  signer: JsonRpcSigner,
  ethBal: number,
  deposit: number,
}

interface contractProps {
  signer: JsonRpcSigner,
  address: string,
}

interface ZapProps {
  depositAmount: number,
  _FromTokenContractAddress: string,
  _pairAddress: string,
  _amount: number,
  _minPoolTokens: number,
  affiliate: string,
  swapData: {},
  transferResidual: boolean
}

interface PoolAPY {
  pool: (Pool & {apy: number})[]
}
interface sushiReturns {
  apys0: (Pool & {
    apy: number
    slpBalanceChange: number,
    slpBalanceChangeCount: number,
    userCountChange: number,
    userCountChangeCount: number,
    sushiHarvestedChange: number,
    sushiHarvestedChangeCount: number
  })[],
  apys14: (Pool & {apy: number})[],
  apys30: (Pool & {apy: number})[],
  apys90: (Pool & {apy: number})[],
}

interface profits {
  p365: number,
  p90: number,
  p30: number,
  p14: number,
  p0: number,
}
interface deposit {
  value: number,
}

interface ilPercents {
  il14: number,
  il30: number,
  il90: number,
}

function getTimeStamps() {
  // should be below
  const nowDay = dayjs(undefined).subtract(1, 'hour')
  // const nowDay = dayjs().subtract(6, 'hour')
  const day14 = nowDay.subtract(2, 'week').unix()
  const day30 = nowDay.subtract(1, 'month').unix()
  const day90 = nowDay.subtract(3, 'month').unix()
  const day0 = dayjs().unix()
  return {
    day0,
    day14,
    day30,
    day90,
  }
}
const mountTimestamps = getTimeStamps()

function calculateCost(gasPrice: number, gas: number, ethPrice: number) {
  const gasInWei = BigNumber.from(String(gasPrice * gas))
  const gasInEther = utils.formatEther(gasInWei)
  const transactionFees = Number(gasInEther) * ethPrice

  return transactionFees
}

function averageAPYSFromMnth(returns: any) {
  let allApys = 0
  const apyKeys = Object.keys(returns)
  apyKeys.forEach((apy) => allApys += Number(returns[apy].apy))
  return allApys / apyKeys.length
}



function findPool(selectedPool: string, returns: sushiReturns) {
  const {
    apys0,
    apys14,
    apys30,
    apys90,
  } = returns

  const apy0 = apys0.filter((pool: any) => pool.pair === selectedPool)[0]
  const apy14 = apys14.filter((pool: any) => pool.pair === selectedPool)[0]
  const apyapy30 = apys30.filter((pool: any) => pool.pair === selectedPool)[0]
  const apyapy90 = apys90.filter((pool: any) => pool.pair === selectedPool)[0]

  return {
    apy0,
    apy14,
    apyapy30,
    apyapy90,
  }
}

function il(startRatio: any, endRatio: any) {
  const ratio = startRatio.token1Price / endRatio.token1Price

  let il = (2 * Math.sqrt(ratio)) / (1 + ratio) - 1;

  return Math.abs(il);
}

function calculateIL(
  pairHistoryDy: any,
  pairHistoryWk: any,
  pairHistoryMnth: any,
  pairHistory3Mnth: any,
) {
  const il14 = il(pairHistoryWk, pairHistoryDy)
  const il30 = il(pairHistoryMnth, pairHistoryDy)
  const il90 = il(pairHistory3Mnth, pairHistoryDy)

  return {
    il14,
    il30,
    il90,
  }
}

const chartTheme = {
  textColor: "#ffffff",
}

const BulletGraph = (data: any) => {
  return (
    <div style={{
      height: '400px',
      maxWidth: '100%',
      background: 'transparent',
      color: 'black',
      fontSize: '1em',
    }}>
      <ResponsiveBullet
        data={data.data}
        margin={{ top: 50, right: 90, bottom: 50, left: 90 }}
        spacing={46}
        layout="vertical"
        titleAlign="start"
        titleOffsetY={-25}
        titleOffsetX={-35}
        measureSize={0.2}
        rangeColors="accent"
        measureColors="red_blue"
        theme={chartTheme}
      />
    </div>
  )
}


function formatChartData(data: any) {
  const labels: { [key: string]: any } = {
    p14: 'Profit 2 Weeks',
    p30: 'Profit 1 Month',
    p90: 'Profit 3 Months',
  }
  // const periods = [14, 30, 90]
  return [14, 30, 90].map((per) => {
    const value: any = {}
    value.id = labels[`p${per}`]
    const profit = data.profit[`p${per}`]
    const il = data.ilPercents[`il${per}`]
    // (profit.p90 - (profit.p90 * ilPercents.il90))
    value.ranges = [0, (profit - (profit * il))]
    value.measures = [0, data.fees]
    return value
  })
}

const small = {
  fontSize: '.5em',
}
const med = {
  fontSize: '.7em',
}

const GasAPY: FC<PoolProp> = (props) => {
  const [avgAPY, setPoolApys] = useState(0)
  const [investment, setInvestment] = useState(5000)
  const [fees, setFees] = useState(0)
  const [error, setError] = useState(false)
  const [profit, setProfit] = useState<profits>({
    p365: 0,
    p90: 0,
    p30: 0,
    p14: 0,
    p0: 0,
  })
  const [ilPercents, setIlPercents] = useState<ilPercents>({
    il14: 0,
    il30: 0,
    il90: 0,
  })
  const [timeStamps] = useState(mountTimestamps)

  useEffect(() => {
    function calculateProfits() {
      // apy is yearly value
      const apyDecimal = avgAPY * .01
      const positiveApy = 1 + apyDecimal
      const yr = (positiveApy * investment) - investment

      setProfit({
        p365: yr,
        p90: yr / 4,
        p30: yr / 12,
        p14: yr / 26,
        p0: yr / 365,
      })
    }

    async function fetchZapInData() {
      try {
        const { pool, signer, ethBal } = props
        const ownerAddress = await signer.getAddress()

        const userSellAmountETH = ethBal - .001
        const sellAmount = String(toBigNumber(userSellAmountETH))
    
        const gasPrices = await fetchGasPrices()
        const currentGasPrice = String(toBigNumber(gasPrices.standard, 9))
    
    
        const zapData = await fetchZapSwapData(
          ownerAddress,
          sellAmount,
          ethAddress,
          pool.Address,
          currentGasPrice,
          0.02
        )
    
        const ethData = await CoinGeckoClient.simple.price({
          ids: ['ethereum'],
          vs_currencies: ['usd'],
        })
        const ethPrice = ethData.data.ethereum.usd
    
        const { gas, gasPrice } = zapData.data
        
        const transactionFees = calculateCost(gasPrice, gas, ethPrice)
    
        setFees(transactionFees)
      } catch (error) {
        console.log({ error })
        setError(true)
      }
    }


    // fetch apys for now, two weeks ago, and one mnth ago
    async function fetchHistoricalSushiVals(pool: string) {
      try {
        const apys0 = await sushiData.masterchef.apys24h({ timestamp: timeStamps.day0 })
        // can query for specific timeperiods so use this for historical 1D/1W/1mnth
        const apys14 = await sushiData.masterchef.apys({ timestamp: timeStamps.day14 })
        const apys30 = await sushiData.masterchef.apys({ timestamp: timeStamps.day30 })
        const apys90 = await sushiData.masterchef.apys({ timestamp: timeStamps.day90 })

        // use this for impermanent loss
        // const chartsHrly = await sushiData.charts.pairHourly({ pair_address: props.pool.Address })
        const poolApys = findPool(pool, { apys0, apys14, apys30, apys90 })
        const averagedAPYS = averageAPYSFromMnth(poolApys)
        setPoolApys(averagedAPYS)
      } catch (error) {
        console.log({ error })
        setError(true)
      }

    }


    async function fetchIL() {
      try {
        const pairHistoryDy = await sushiData.exchange.pair({ pair_address: props.pool.Address, timestamp: timeStamps.day0 })
        const pairHistoryWk = await sushiData.exchange.pair({ pair_address: props.pool.Address, timestamp: timeStamps.day14 })
        const pairHistoryMnth = await sushiData.exchange.pair({ pair_address: props.pool.Address, timestamp: timeStamps.day30 })
        const pairHistory3Mnth = await sushiData.exchange.pair({ pair_address: props.pool.Address, timestamp: timeStamps.day90 })

        const ratios = calculateIL(
          pairHistoryDy,
          pairHistoryWk,
          pairHistoryMnth,
          pairHistory3Mnth
        )
        
        setIlPercents(ratios)
      } catch (error) {
        console.log({ error })
        setError(true)
      }
    } 
    setInvestment(props.deposit)

    fetchHistoricalSushiVals(props.pool.Address)
    calculateProfits()
    fetchZapInData()
    fetchIL()
  }, [props, avgAPY, investment, timeStamps])
  const chartData = formatChartData({ profit, fees, ilPercents })

  if (error) {
    return <div style={{ color: 'red' }}>There was an error fetching data, please refresh.</div>
  }

  return (
    <Row
      style={{
        maxWidth: '100%',
      }}
    >
      <Col
        debug xs={4} sm={4} md={6} lg={6}
        style={{
          backgroundColor: 'transparent',
        }}
      >
        <Header2>
          {props.pool['Liquidity Pool']}
        </Header2>
        <div style={med}>Sample Investment Amnt: {investment}</div>
        <div style={med}>APY: %{avgAPY} (Averaged APY from (1d, 2wk, 1mnth, 3mnth))</div>
        <div style={small}>{props.pool.Address}</div>
        <div style={small}>Transaction Fee: {fees}</div>
        <GasAPYElement content={{ profit, ilPercents, fees }} />
      </Col>
      <Col
        debug xs={4} sm={4} md={6} lg={6}
        style={{
          backgroundColor: 'transparent',
        }}
      >
        <BulletGraph data={chartData}/>
      </Col>
    </Row>
  )
}

export { GasAPY, med }
