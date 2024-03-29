import { BigNumber } from 'ethers'

export type Address = string;

export interface ContractAddresses {
  adapterRegistry: Address;
}

//TODO:
// getProtocolBalanceAtBlock(protocol, block)
// getBalancesForPools?
export interface DeFiSDKInterface {
  getProtocolNames(): Promise<string[]>;
  getProtocolMetaData(protocol: string): Promise<ProtocolMetadataInterface>;
  getTokenAdapterNames(): Promise<string[]>;
  getProtocolBalance(
    account: Address,
    protocol: string
  ): Promise<ProtocolBalanceInterface>;
  getProtocolBalances(
    account: Address,
    protocols: [string]
  ): Promise<[ProtocolBalanceInterface]>;
  getAccountBalances(account: Address): Promise<[ProtocolBalanceInterface]>;
  getTokenComponents(
    type: string,
    token: Address
  ): Promise<[TokenBalanceInterface]>;
}

export interface ProtocolMetadataInterface {
  name: string;
  description: string;
  website: URL;
  logo: URL;
  version: BigInt;
}

export interface TokenMetadataInterface {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
}

export interface TokenBalanceInterface {
  metadata: TokenMetadataInterface;
  balance: BigInt;
  //TODO: I wouldn't say I like this dependency on the concrete implementation, but BigNumberish seems to be a wrong interface as well
  getAmount(): BigNumber;
}

export interface AssetBalanceInterface {
  base: TokenBalanceInterface;
  underlying: [TokenBalanceInterface];
}

export interface AdapterMetadataInterface {
  address: Address;
  type: string;
}

export interface AdapterBalanceInterface {
  metadata: AdapterMetadataInterface;
  balances: [AssetBalanceInterface];
}

export interface ProtocolBalanceInterface {
  metadata: ProtocolMetadataInterface;
  balances: [AdapterBalanceInterface];
}
