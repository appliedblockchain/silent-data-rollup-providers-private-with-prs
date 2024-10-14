import { SignatureType } from '@silentdatarollup/core'

export interface SilentdataNetworkConfig {
  authSignatureType: SignatureType
  maxRetries?: number
  pollingInterval?: number
}
