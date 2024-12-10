// @ts-nocheck
import 'dotenv/config'

import {
  NetworkName,
  ChainId,
  SilentDataRollupContract,
} from '@appliedblockchain/silentdatarollup-core'
import { SilentDataRollupProvider } from '@appliedblockchain/silentdatarollup-ethers-provider'
import { formatEther, Wallet, parseUnits } from 'ethers'
import { ERC20_ABI } from './erc20Abi'

const REQUIRED_ENV_VARS = ['RPC_URL', 'PRIVATE_KEY'] as const

REQUIRED_ENV_VARS.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} environment variable is required`)
  }
})

const RPC_URL = process.env.RPC_URL as string
const PRIVATE_KEY = process.env.PRIVATE_KEY as string

// Set the token address
const TOKEN_ADDRESS = '0x5fbdb2315678afecb367f032d93f642f64180aa3'

const provider = new SilentDataRollupProvider({
  rpcUrl: RPC_URL,
  network: NetworkName.TESTNET_DEV,
  chainId: ChainId.TESTNET_DEV,
  privateKey: PRIVATE_KEY,
})

const tokenContract = new SilentDataRollupContract(
  TOKEN_ADDRESS,
  ERC20_ABI,
  // @ts-ignore
  // Note: Transacting with the contract requires the signer. See how we pass the signer to the contract.
  provider.signer,
  // Note: The methods that require the signer are protected and only available for the owner of the address.
  ['balanceOf']
)

const main = async () => {
  const [decimals, name, symbol] = await Promise.all([
    tokenContract.decimals(),
    tokenContract.name(),
    tokenContract.symbol(),
  ])

  console.log('Contract address:', TOKEN_ADDRESS)
  console.log('Token Name:', name)
  console.log('Token Symbol:', symbol)
  console.log('Decimals:', decimals)

  // Generate random wallet and transfer tokens
  const randomWallet = Wallet.createRandom()
  const tx = await tokenContract.transfer(
    randomWallet.address,
    parseUnits('100', decimals)
  )

  console.log('Sent 100 tokens to', randomWallet.address)

  try {
    console.log('\nGetting random wallet token balance...')
    const randomWalletTokenBalance = await tokenContract.balanceOf(
      randomWallet.address
    )
  } catch (error) {
    console.error(
      "❌ Ups... I can't get the random wallet token balance. The balanceOf method is protected, only for the owner of the address can query it."
    )
  }

  console.log('\nGetting my token balance...')
  const balance = await tokenContract.balanceOf(
    await provider.signer.getAddress()
  )
  console.log('✅ My token balance:', formatEther(balance), symbol)
}

main()
