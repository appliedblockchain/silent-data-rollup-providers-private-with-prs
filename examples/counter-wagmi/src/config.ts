import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import { createConfig, http } from 'wagmi'
import { hardhat } from 'wagmi/chains'
import { coinbaseWallet, injectedWallet, ledgerWallet, metaMaskWallet, rainbowWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets'
import { silentdata } from '@appliedblockchain/silentdatarollup-viem-plugin'

export const config = createConfig({
  chains: [hardhat, silentdata],
  ssr: true,
  transports: {
    [hardhat.id]: http(),
    [silentdata.id]: http(),
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