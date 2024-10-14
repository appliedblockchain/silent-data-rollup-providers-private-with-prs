import {
  delegateEIP721Types,
  DelegateSignerMessage,
  eip721Domain,
  getAuthEIP721Types,
  SignatureType,
  SilentDataRollupBase,
} from '@silentdatarollup/core'
import debug from 'debug'
import {
  PeerType,
  TransactionArguments,
  TransactionOperation,
} from 'fireblocks-sdk'
import { DEBUG_NAMESPACE_SILENTDATA_INTERCEPTOR } from './constants'
import { hashMessage, JsonRpcPayload } from 'ethers'

const log = debug(DEBUG_NAMESPACE_SILENTDATA_INTERCEPTOR)

export class SilentDataRollupFireblocksBase extends SilentDataRollupBase {
  public async createPersonalSignature(
    provider: any,
    content: any,
    operation: TransactionOperation,
    type?: SignatureType,
  ): Promise<string> {
    log('Signing message. Operation:', operation, 'Type:', type)
    const vaultAccountId = provider.ethereum.vaultAccountIds[0]?.toString()
    log('Using vault account ID:', vaultAccountId)
    const transactionArguments: TransactionArguments = {
      operation,
      assetId: provider.ethereum.assetId,
      source: {
        type: PeerType.VAULT_ACCOUNT,
        id: vaultAccountId,
      },
      extraParameters: {
        rawMessageData: {
          messages: [
            { content, ...(type === SignatureType.EIP712 ? { type } : {}) },
          ],
        },
      },
    }

    const txInfo =
      await provider.ethereum.createTransaction(transactionArguments)
    log('Transaction created. TxInfo:', txInfo)
    const sig = txInfo!.signedMessages![0].signature
    const v = 27 + sig.v!
    const signature = '0x' + sig.r + sig.s + v.toString(16)
    log('Signature generated:', signature)
    return signature
  }

  public async signRawDelegateHeader(
    provider: any,
    message: DelegateSignerMessage,
  ): Promise<string> {
    log('Signing raw delegate header. Message:', message)
    const content = hashMessage(JSON.stringify(message)).split('0x')[1]
    return this.createPersonalSignature(
      provider,
      content,
      TransactionOperation.RAW,
      SignatureType.Raw,
    )
  }

  public async signTypedDelegateHeader(
    provider: any,
    message: DelegateSignerMessage,
  ) {
    log('Signing typed delegate header. Message:', message)

    const content = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
        ],
        ...delegateEIP721Types,
      },
      primaryType: 'Call',
      domain: eip721Domain,
      message: message,
    }

    log('EIP712 content created:', content)
    return this.createPersonalSignature(
      provider,
      content,
      TransactionOperation.TYPED_MESSAGE,
      SignatureType.EIP712,
    )
  }

  public async signAuthHeaderRawMessage(
    provider: any,
    payload: JsonRpcPayload | JsonRpcPayload[],
    timestamp: string,
  ): Promise<string> {
    log('Preparing raw message for signing')
    const message = this.prepareSignatureMessage(payload, timestamp)
    log('Raw message:', message)
    const delegateSigner = await this.getDelegateSigner(this)
    let signature: string
    if (delegateSigner) {
      signature = await this.signMessage(delegateSigner, message)
      log('Raw signature generated by delegate signer:', signature)
      return signature
    } else {
      const content = hashMessage(JSON.stringify(message)).split('0x')[1]
      log('EIP191 content:', content)
      signature = await this.createPersonalSignature(
        provider,
        content,
        TransactionOperation.RAW,
      )
    }

    log('Raw signature generated:', signature)
    return signature
  }

  public async signAuthHeaderTypedData(
    provider: any,
    payload: JsonRpcPayload | JsonRpcPayload[],
    timestamp: string,
  ): Promise<string> {
    const types = getAuthEIP721Types(payload)
    const message = this.prepareSignatureTypedData(payload, timestamp)

    const content = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
        ],
        ...types,
      },
      primaryType: 'Call',
      domain: eip721Domain,
      message: message,
    }

    log('EIP712 content created:', content)
    return this.createPersonalSignature(
      provider,
      content,
      TransactionOperation.TYPED_MESSAGE,
      SignatureType.EIP712,
    )
  }
}
