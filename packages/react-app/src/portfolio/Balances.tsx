import { DeFiSDK } from 'defi-sdk'
import React, { FC, ReactElement, useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-awesome-styled-grid'
import styled from 'styled-components'
import {
  Header2,
  Image
} from '../components'
import { ProtocolBalanceInterface } from './types/defiSdkEntities'

function formatBigNumber({ balance, decimals = 18 } : { balance: BigInt, decimals: number }) {
  const numBalance = Number(balance)
  return numBalance / 10**decimals
}

const HeaderImg = styled(Image)`
  width: 20%;
  height: auto;
`

const nodeUrl = 'https://eth-mainnet.zerion.io/'
const defiSdk = new DeFiSDK(nodeUrl)

interface BalanceProps {
  userAccounts?: string[]
}

type ColProps = { child: string | number | ReactElement };
export const SmallColumn = ({child}: ColProps) => 
  <Col
    debug xs={4} sm={4} md={6} lg={6}
    style={{
      backgroundColor: 'transparent',
    }}
  >
    { child }
  </Col>

export const Column = ({child}: ColProps) => 
  <Col
    debug xs={4} sm={4} md={4} lg={6}
    style={{
      backgroundColor: 'transparent',
      height: '200px',
    }}
    >
    <div style={{
      border: 'solid 1px #49515f',
      borderRadius: '5px',
      height: '100%',
      paddingLeft: '10px',
    }}>
      { child }
    </div>
  </Col>


const Content = (props: any) => 
  <div>
    <Header2>
      <Row>
        <SmallColumn child={props.metadata.name}/>
        <SmallColumn child={<HeaderImg src={props.metadata.logo.href} alt={props.metadata.name} />}/>
      </Row>
    </Header2>
    {props.balances.map((balance: any, i: number) => <div key={i}>
    { balance.balances[0].base.metadata.symbol } : { formatBigNumber({
      balance: balance.balances[0].base.balance,
      decimals: balance.balances[0].base.metadata.decimals
    }) } 
    </div>)}
  </div>

const Balance: FC<ProtocolBalanceInterface> = (props) => {
  const { metadata, balances } = props
  return (
    <Column child={<Content metadata={metadata} balances={balances} />} />
  )
}

const Balances: FC<BalanceProps> = ({ userAccounts }): ReactElement => { 
  const [balances, setAllBalances] = useState([])
  useEffect(() => {
    async function fetchBalances(id: string) {
      const balances = await defiSdk.getAccountBalances(id)
      setAllBalances(balances)
    }

    if (userAccounts) {
      fetchBalances(userAccounts[0])
    }
  }, [userAccounts])

  if (userAccounts) {
    return (
      <Container>
        Defi Balances
        <Row>
          { 
            balances.map((balance: ProtocolBalanceInterface, i) =>
              <Balance
                key={i}
                metadata={balance.metadata}
                balances={balance.balances}
                />)
          }
        </Row>
      </Container>
    )
  }
  return (
    <div>
      Loading
    </div>
  )
}

export default Balances
