import {
	Chain,
	custom,
	Transport,
} from 'viem'
import { NetworkName, SignatureType } from '@appliedblockchain/silentdatarollup-core'
import { SilentDataRollupProvider } from './provider'
import { getSigner } from './get-signer'
import { Sender } from './sender'
export type SilentDataTransportConfig = {
	/**
	 * The RPC URL
	 */
	rpcUrl?: string

	delegate?: boolean

	chainId?: number

	signatureType?: SignatureType

	network?: NetworkName

	methodsToSign?: string[]

	chain?: Chain

}

/**
 * Creates a Viem transport for SilentData RPC
 */
export function sdt({
	rpcUrl,
	chainId,
	signatureType,
	network,
	delegate,
	methodsToSign,
	chain,
}: SilentDataTransportConfig = {}): Transport {
	const chainId_ = chain?.id ?? chainId
	const rpcUrl_ = chain?.rpcUrls.default.http[0] ?? rpcUrl
	
	const provider = SilentDataRollupProvider.configure({
		rpcUrl: rpcUrl_,
		chainId: chainId_,
		delegate,
		signatureType,
		network,
		methodsToSign
	})

	const sender = new Sender(provider)
	
	return custom({
		async request({ method, params }) {	
			if (!provider.wagmiConfig) {
				throw new Error('wagmiConfig is not set')
			}

			provider.signer = await getSigner(provider.wagmiConfig)
			// Use sender.send instead to manage concurrent requests with signed session
			return sender.send(method, params)
		},
	}, {
		key: 'silentdata',
		name: 'SilentData JSON-RPC',
	})
} 