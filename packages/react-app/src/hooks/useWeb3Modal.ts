import { useCallback, useEffect, useState } from "react";
import { Web3Provider, JsonRpcSigner } from "@ethersproject/providers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { Provider } from '@ethersproject/abstract-provider'
import { ethers } from 'ethers'

// Enter a valid infura key here to avoid being rate limited
// You can get a key for free at https://infura.io/register
const INFURA_ID = "08fc0e9904b34a84a105f78612752b33";

const NETWORK_NAME = "mainnet";

interface configObject{
  autoLoad: boolean,
  infuraId: string,
  NETWORK: string,
}

function useWeb3Modal() {
  const [provider, setProvider] = useState<Web3Provider>();
  const [autoLoaded, setAutoLoaded] = useState(false);
  const [signer, setSigner] = useState<JsonRpcSigner>()
  const autoLoad = true
  const infuraId = INFURA_ID
  const NETWORK = NETWORK_NAME
  // const { autoLoad = true, infuraId = INFURA_ID, NETWORK = NETWORK_NAME } = config;

  // Web3Modal also supports many other wallets.
  // You can see other options at https://github.com/Web3Modal/web3modal
  const web3Modal = new Web3Modal({
    network: NETWORK,
    cacheProvider: true,
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId,
        },
      },
    },
  });

  // Open wallet selection modal.
  const loadWeb3Modal = useCallback(async () => {
    const newProvider = await web3Modal.connect();
    const provider = new Web3Provider(newProvider)
    setProvider(provider);
    // const newSigner = provider.getSigner()
  }, [web3Modal]);

  const logoutOfWeb3Modal = useCallback(
    async function () {
      await web3Modal.clearCachedProvider();
      window.location.reload();
    },
    [web3Modal],
  );

  // If autoLoad is enabled and the the wallet had been loaded before, load it automatically now.
  useEffect(() => {
    if (autoLoad && !autoLoaded && web3Modal.cachedProvider) {
      loadWeb3Modal();
      setAutoLoaded(true);
    }
  }, [signer, autoLoad, autoLoaded, loadWeb3Modal, setAutoLoaded, web3Modal.cachedProvider]);

  return [provider, loadWeb3Modal, logoutOfWeb3Modal];
}

export default useWeb3Modal;