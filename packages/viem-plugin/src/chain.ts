import { defineChain } from 'viem'

/**
 * Define the SilentData chain
 */
export const silentdata = defineChain({
	id: 33939,
	name: 'SilentData',
	nativeCurrency: {
		decimals: 18,
		name: 'Ether',
		symbol: 'ETH',
	},
	rpcUrls: {
		default: { http: ['https://cdk-tdx-gcp.rollup.silentdata.com/942ae452ebede37256d86c23ba6593f5'] },
	},
	iconBackground: '#fff',
	iconUrl: 'https://cdn.prod.website-files.com/66e010db8f2318d36725b915/6703b8f9e62df0eead9f0721_sd-favicon.png',
})

