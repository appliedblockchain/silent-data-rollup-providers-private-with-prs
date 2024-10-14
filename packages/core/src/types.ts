import { JsonRpcPayload, Signer } from 'ethers'
import {
  HEADER_DELEGATE,
  HEADER_DELEGATE_SIGNATURE,
  HEADER_EIP712_DELEGATE_SIGNATURE,
  HEADER_EIP712_SIGNATURE,
  HEADER_SIGNATURE,
  HEADER_TIMESTAMP,
} from './constants'

export enum ChainId {
  MAINNET = 51966,
  TESTNET = 1001,
}

export enum NetworkName {
  MAINNET = 'sdr',
  TESTNET = 'sdr-testnet',
}

export enum SignatureType {
  Raw = 'RAW',
  EIP191 = 'EIP191',
  EIP712 = 'EIP712',
}

export interface SilentDataProviderOptions {
  authSignatureType?: SignatureType
}

export interface SilentdataNetworkConfig {
  authSignatureType?: SignatureType
}

export type DelegateConfig = {
  getDelegate: (provider: any) => Promise<Signer>
  expires: number
}

export type BaseConfig = {
  /**
   * Configuration for delegate functionality.
   * - If true, uses default delegate configuration.
   * - If an object, allows customization of delegate behavior.
   * - If undefined or false, delegate functionality is disabled.
   */
  delegate?:
    | boolean
    | {
        /**
         * Custom function to get a delegate signer.
         * If not provided, defaults to the defaultGetDelegate function.
         */
        getDelegate?: (provider: any) => Promise<Signer>
        /**
         * Expiration time for the delegate in seconds.
         * If not provided, defaults to DEFAULT_DELEGATE_EXPIRES.
         */
        expires?: number
      }
  authSignatureType?: SignatureType
}

export type DelegateSignerMessage = {
  expires: string
  ephemeralAddress: string
}

export type AuthSignatureMessage = {
  request: AuthSignatureMessageRequest | AuthSignatureMessageRequest[]
  timestamp: string
}

export type AuthSignatureMessageRequest = Omit<JsonRpcPayload, 'params'> & {
  params: string
}

export type AuthHeaders = {
  [HEADER_TIMESTAMP]: string
  [HEADER_SIGNATURE]?: string
  [HEADER_EIP712_SIGNATURE]?: string
}

export type DelegateHeaders = {
  [HEADER_DELEGATE]: string
  [HEADER_DELEGATE_SIGNATURE]?: string
  [HEADER_EIP712_DELEGATE_SIGNATURE]?: string
}
