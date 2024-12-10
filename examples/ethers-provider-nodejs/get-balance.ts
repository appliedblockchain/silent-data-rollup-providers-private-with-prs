import 'dotenv/config'

import { NetworkName } from '@appliedblockchain/silentdatarollup-core'
import { SilentDataRollupProvider } from '@appliedblockchain/silentdatarollup-ethers-provider'
import { formatEther, Wallet } from 'ethers'

const REQUIRED_ENV_VARS = ['RPC_URL', 'PRIVATE_KEY'] as const

REQUIRED_ENV_VARS.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} environment variable is required`)
  }
})

const RPC_URL = process.env.RPC_URL as string
const PRIVATE_KEY = process.env.PRIVATE_KEY as string

const provider = new SilentDataRollupProvider({
  rpcUrl: RPC_URL,
  chainId: 31337,
  privateKey: PRIVATE_KEY,
})

const main = async () => {
  const wallet = new Wallet(PRIVATE_KEY)
  const balance = await provider.getBalance(wallet.address)
  console.log('Balance:', formatEther(balance))
}

main()
