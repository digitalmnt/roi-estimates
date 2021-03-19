import { abis, addresses, MAINNET_ID } from "@aave-app/contracts";
import { useQuery } from "@apollo/react-hooks";
import { Contract } from "@ethersproject/contracts";
import { getDefaultProvider } from "@ethersproject/providers";
import dayjs from 'dayjs';
import React, { useState } from "react";
import { Container } from 'react-awesome-styled-grid';
import { Body, Button, Header, Image } from "./components";
import { sushilist, unilist } from './Data/Lists';
import SushiCalcNew from './Data/SushiCalcNew';
import UniCalcNew from './Data/UniCalcNew';
import logo from "./ethereumLogo.png";
import GET_LENDING_POOL_CONFIGURATION_HISTORY_ITEMS from "./graphql/subgraph";
import useWeb3Modal from "./hooks/useWeb3Modal";
import Balances from './portfolio/Balances';
import { GasAPY } from './portfolio/GasAPY';
import PoolTable from './portfolio/Pools';
import { utils } from 'ethers'
import { Deposit } from "./portfolio/Deposit";


const poolOptions = {
  sushi: {
    service: (list) => SushiCalcNew(list),
    list: sushilist,
  },
  uni: {
    service: (list) => UniCalcNew(list),
    list: unilist,
  }
}

const fetchLiquidityPoolData = async (type) => {
  const pool = poolOptions[type]
  let [status, response] = await pool.service(pool.list)
  if (status === false) {
    const lastRefresh = dayjs().format()
    const loading = false
    return {
      response,
      lastRefresh,
      loading,
    }
  }
}

async function readOnChainData() {
  // Should replace with the end-user wallet, e.g. Metamask
  const defaultProvider = getDefaultProvider();
  // Create an instance of an ethers.js Contract
  // Read more about ethers.js on https://docs.ethers.io/v5/api/contract/contract/
  const aDAIContract = new Contract(addresses[MAINNET_ID].tokens.aDAI, abis.aToken, defaultProvider);
  // A pre-defined address that owns some aDAI tokens
  const aDAIBalance = await aDAIContract.balanceOf("0x3f8CB69d9c0ED01923F11c829BaE4D9a4CB6c82C");
  // console.log({ aDAIBalance: aDAIBalance.toString() });
}

function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  return (
    <Button
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {!provider ? "Connect Wallet" : "Disconnect Wallet"}
    </Button>
  );
}

function App() {
  const { loading, error, data } = useQuery(GET_LENDING_POOL_CONFIGURATION_HISTORY_ITEMS);
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();
  const [accounts, setAccounts] = useState()
  const [gasEstimates, addGasEstimate] = useState([])
  const [signer, setSigner] = useState()
  const [poolsLoading, setLoading] = useState({
    sushi: true,
  })
  const [sushiVals, setSushiVals] = useState()
  const [ethBalance, setEthBal] = useState()

  const [deposit, setDeposit] = useState(5000)

  const fetchAccounts = async (provider) => {
    const accounts = await provider.listAccounts()
    const walletBalance = await provider.getBalance(accounts[0])
    const humanBalance = utils.formatEther(walletBalance)

    setEthBal(humanBalance)
    setAccounts(accounts)
  }

  const fetchPoolData = async () => {
    const loadingVals = {
      uni: true,
      sushi: true,
    }

    const sushiData = await fetchLiquidityPoolData('sushi')
    loadingVals.sushi = sushiData.loading

    setSushiVals(sushiData)
    setLoading(loadingVals)
  }

  function depositUpdated(deposit) {
    setDeposit(deposit)
  }
  
  React.useEffect(() => {
    if (provider) {
      fetchAccounts(provider)
      const signer = provider.getSigner()
      setSigner(signer)
    }

    fetchPoolData()
  }, [provider, loading, error, data]);

  return (
    <div style={{ width: '100%' }}>
      <Header>
        <Image src={logo} alt="react-logo" />
        <div>Wallet Eth Balance: { ethBalance }</div>
        <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
      </Header>
      <Body>
        <Container>
          <div class="notes">
            <div>Connect wallet to see the cost of entering the pool and the impact on profits</div>
            <div>
              Transaction fee is the cost of <a
                href="https://etherscan.io/address/0xcff6eF0B9916682B37D80c19cFF8949bc1886bC2"
                rel="noopener noreferrer"
                target="_blank">Zapping</a> into the <a
                rel="noopener noreferrer"
                href="https://app.sushi.com/farms/permanent"
                target="_blank">SushSwap Pool</a> using the ETH in your wallet.
            </div>
            <div>APY provided by <a
              href="https://github.com/sushiswap/sushi-data"
              target="_blank"
              rel="noopener noreferrer"
            >github.com/sushiswap/sushi-data</a></div>
            <div>Impact of impermanent loss was based off <a
                rel="noopener noreferrer"
                href="https://uniswap.org/docs/v2/advanced-topics/understanding-returns/"
                target="_blank">https://uniswap.org/docs/v2/advanced-topics/understanding-returns/</a></div>
          </div>
          <div>
            <Balances userAccounts={accounts} />
            <Deposit onDeposit={depositUpdated}/>
            <Container>
              {gasEstimates.map((pool) => <GasAPY
                ethBal={ethBalance}
                pool={pool}
                key={pool.Address}
                signer={signer}
                deposit={deposit}
              />)}
            </Container>
          </div>
          {!poolsLoading.sushi &&
            <PoolTable data={sushiVals} onPoolRowClick={(row) => {
              const uniqueGastimates = new Set([...gasEstimates, row])
              return addGasEstimate([...uniqueGastimates])
            }} />
          }
          <div class="notes">
            <div>I'm just a nerd who is interested in DeFi. This is NOT investment advice. Created by <a href="https://twitter.com/RunRidg">@RunRidg</a>. Hit me up!</div>
            <div>Table data provided by <a
              href="https://github.com/aschmidt20/LiquidYield"
              target="_blank"
              rel="noopener noreferrer"
              >aschmidt20</a></div>
          </div>
        </Container>
      </Body>
    </div>
  );
}

export default App;
