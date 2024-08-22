# rollup-connector

**Silent Data Rollup RPC Connector: A Provider Wrapper with Built-in Signing Features.**

This wrapper acts as an intermediary, abstracting complexities and offering developers a simplified interface to connect to SDR's RPC seamlessly. 

## Installation

```sh
yarn add @silentdata/rollup-connector
```

## Features
- Custom Provider with injected signed request headers;
- Contract Deployment;
- Get contract;
- Get contract with different signer;
- Customize which methods should be signed;

## Methods to be signed by default
```ts
const DEFAULT_SIGN_METHODS = [
  'eth_getTransactionByHash',
  'eth_getBalance',
  'eth_getTransactionCount',
  'eth_getProof',
  'eth_getTransactionReceipt',
  'eth_call',
]
```


## Usage

```ts
import { 
  init, 
  deployContract, 
  getContract, 
  getProvider,
  SilentDataRollupRPCProvider 
} from '@silentdata/rollup-connector'
```


## Initialize the connector
```ts
// with private key
const signer = new ethers.Wallet(signerPK)

// or with metamask
const provider = new ethers.BrowserProvider(window.ethereum)
const signer = await provider.getSigner()

// connection
const RPC_URL = 'https://testnet.silentdata.com/<your-auth-token>'
const NETWORK_NAME = 'SDR'
const CHAIN_ID = 51966
// optional - customize the methods that should be signed
const SIGN_METHODS = ['eth_call']

await init(RPC_URL, NETWORK_NAME, CHAIN_ID, signer, SIGN_METHODS)
```

## Deploy a contract
```ts
await deployContract(
  ContractArtifact.abi,
  ContractArtifact.bytecode,
  [...args]
)
```

## Get a contract
```ts
// with the init signer
const contract = await getContract(
  CONTRACT_ADDRESS,
  ContractArtifact.abi
)
// with a custom signer
const contract = await getContract(
  CONTRACT_ADDRESS,
  ContractArtifact.abi,
  customSigner
)
// call contract method with signer
await contract.balanceOf(signer.address)
```
