import { ChainId } from '@appliedblockchain/silentdatarollup-core'
import { defineChain } from 'viem'

/**
 * Define the SilentData chain
 */
export const silentdata = defineChain({
	id: ChainId.MAINNET,
	name: 'SilentData',
	nativeCurrency: {
		decimals: 18,
		name: 'Ether',
		symbol: 'ETH',
	},
	rpcUrls: {
		default: { http: ['https://mainnet.rollup.silentdata.com'] },
	},
	iconBackground: '#fff',
	iconUrl: 'https://cdn.prod.website-files.com/66e010db8f2318d36725b915/6703b8f9e62df0eead9f0721_sd-favicon.png',
})

export const sd_testnet = (chainId?: number) => defineChain({
	id: chainId || ChainId.TESTNET,
	name: 'SilentData Testnet',
	nativeCurrency: {
		decimals: 18,
		name: 'Ether',
		symbol: 'ETH',
	},
	rpcUrls: {
		default: { http: ['https://testnet.rollup.silentdata.com'] },
	},
	iconBackground: '#fff',
	iconUrl: 'https://cdn.prod.website-files.com/66e010db8f2318d36725b915/6703b8f9e62df0eead9f0721_sd-favicon.png',
})

