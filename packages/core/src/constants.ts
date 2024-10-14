export const SIGN_RPC_METHODS = [
  'eth_getTransactionByHash',
  'eth_getBalance',
  'eth_getTransactionCount',
  'eth_getProof',
  'eth_getTransactionReceipt',
  'eth_getBlockByNumber',
]

export const eip721Domain = {
  name: 'Silent Data [Rollup]',
  version: '1',
}

// export const eip721Domain = {
//   name: 'Silent Data [Rollup]',
//   version: '1',
//   chainId: '1001',
//   verifyingContract: '0x',
//   salt: ' ',
// }

export const delegateEIP721Types = {
  Ticket: [
    { name: 'expires', type: 'string' },
    { name: 'ephemeralAddress', type: 'string' },
  ],
}

export const DEBUG_NAMESPACE = 'silentdata:core'
export const DEBUG_NAMESPACE_SILENTDATA_INTERCEPTOR = 'silentdata:interceptor'

export const HEADER_SIGNATURE = 'x-signature'
export const HEADER_TIMESTAMP = 'x-timestamp'
export const HEADER_EIP712_SIGNATURE = 'x-eip712-signature'
export const HEADER_DELEGATE = 'x-delegate'
export const HEADER_DELEGATE_SIGNATURE = 'x-delegate-signature'
export const HEADER_EIP712_DELEGATE_SIGNATURE = 'x-eip712-delegate-signature'

export const DEFAULT_DELEGATE_EXPIRES = 7 * 24 * 60 * 60 // 1 week
