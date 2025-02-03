import { defineChain } from 'viem'

/**
 * Define the SilentData chain
 */
export const silentdata = defineChain({
	id: Number(process.env.NEXT_PUBLIC_SILENTDATA_CHAIN_ID) || 33939,
	name: 'SilentData',
	nativeCurrency: {
		decimals: 18,
		name: 'Ether',
		symbol: 'ETH',
	},
	rpcUrls: {
		default: { http: [process.env.NEXT_PUBLIC_SILENTDATA_RPC_URL || 'https://testnet.rollup.silentdata.com/'] },
	},
	iconBackground: '#fff',
	iconUrl: 'https://cdn.prod.website-files.com/66e010db8f2318d36725b915/6703b8f9e62df0eead9f0721_sd-favicon.png',
})

