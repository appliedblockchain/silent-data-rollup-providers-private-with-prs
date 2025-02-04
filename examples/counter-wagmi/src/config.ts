import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import { createConfig, http } from 'wagmi'
import { hardhat } from 'wagmi/chains'
import { coinbaseWallet, injectedWallet, ledgerWallet, metaMaskWallet, rainbowWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets'
import { sd_testnet, sdt, NetworkName} from '@appliedblockchain/silentdatarollup-viem-plugin'

const sdChainId = +import.meta.env.VITE_SILENTDATA_CHAIN_ID
const sdRpcUrl = import.meta.env.VITE_SILENTDATA_RPC_URL || 'https://testnet.rollup.silentdata.com'

export const config = createConfig({
  chains: [hardhat, sd_testnet(sdChainId)],
  ssr: true,
  transports: {
    [hardhat.id]: http(),
    [sdChainId]: sdt({
      rpcUrl: sdRpcUrl,
      network: NetworkName.TESTNET,
      methodsToSign: [] // TODO: add methods to sign
    }),
  },
  connectors: connectorsForWallets([{
    groupName: 'Supported Wallets',
    wallets: [
      metaMaskWallet,
      walletConnectWallet,
      coinbaseWallet,
      rainbowWallet,
      ledgerWallet,
      injectedWallet,
    ]
  }], {
    appName: 'Simple Counter Web3',
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '',
  })
})