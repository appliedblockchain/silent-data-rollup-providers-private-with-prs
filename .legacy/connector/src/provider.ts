import { ethers } from 'ethers'
import fetch from 'node-fetch'
import {
  Fireblocks,
  TransactionOperation,
  TransactionStateEnum,
  TransferPeerPathType,
} from "@fireblocks/ts-sdk"

export interface FireblocksSigner {
  fireblocks: Fireblocks
  assetId: string
  vaultAccountId: string
}

export class SilentDataRollupRPCProvider extends ethers.JsonRpcProvider implements ethers.Provider {
  private requestId = 0
  private readonly rpcUrl: string
  private signer: ethers.Signer | FireblocksSigner | null = null
  private headers: Record<string, string> = {}
  public signMethods: string[] = []
  public typeSign: "RAW" | "EIP191" | "EIP712" = "RAW"

  constructor(rpcUrl: string, name: string, chainId: number, sign_methods?: Array<string>) {
    super(rpcUrl, {
        name,
        chainId,
      })
    this.rpcUrl = rpcUrl
    if (sign_methods) {
      this.signMethods = sign_methods
    }
  }

  setSigner(signer: ethers.Signer | FireblocksSigner) {
    this.signer = signer
  }

  setHeaders(headers: Record<string, string>) {
    this.headers = headers
  }

  setSignMethods(sign_methods: Array<string>) {
    this.signMethods = sign_methods
  }

  setTypeSign(typeSign: "RAW" | "EIP191" | "EIP712") {
    this.typeSign = typeSign
  }

  async send(method: string, params: unknown[]): Promise<unknown> {
    const id = ++this.requestId
    const payload = {
      jsonrpc: "2.0",
      id,
      method,
      params,
    }

    if (this.signMethods.includes(method)) {
      const signer = this.signer as ethers.Signer
      const xTimestamp = (new Date()).toISOString()

      const domain = {
        name: "Silent Data [Rollup]",
        version: "1",
      }
  
      const types = {
        Call: [
          { name: "jsonrpc", type: "string" },
          { name: "id", type: "uint256" },
          { name: "method", type: "string" },
          { name: "params", type: "string" },
          { name: "timestamp", type: "string" }
        ]
      }
  
      const message = {
        jsonrpc: payload.jsonrpc,
        id: payload.id,
        method: payload.method,
        params: JSON.stringify(payload.params),
        timestamp: xTimestamp,
      }

      const isDomainSignType = this.typeSign === "EIP712"
      const xMessage = JSON.stringify(payload) + xTimestamp

      let xSignature = ''
      if (signer && signer.signMessage === undefined) {

        let content = null
        if (this.typeSign === "RAW") {
          content = ethers.hashMessage(xMessage).split("0x")[1]
        } else if (this.typeSign === "EIP191") {
          content = Buffer.from(xMessage).toString("hex")
        } else if (isDomainSignType) { 
          content = {
            types: {
              EIP712Domain: [
                { name: "name", type: "string" },
                { name: "version", type: "string" },
              ],
              ...types
            },
            primaryType: "Call",
            domain,
            message,
          }
        }

        const { data: { id } } = await (this.signer as FireblocksSigner).fireblocks.transactions.createTransaction({
          transactionRequest: {
            operation: this.typeSign === "RAW" ? TransactionOperation.Raw : TransactionOperation.TypedMessage,
            assetId: (this.signer as FireblocksSigner).assetId,
            source: {
              type: TransferPeerPathType.VaultAccount,
              id: (this.signer as FireblocksSigner).vaultAccountId,
            },
            extraParameters: {
              rawMessageData: {
                messages: [{
                  content,
                  ...this.typeSign !== "RAW" && {type: this.typeSign},
                }],
              },
            },
          }
        });
        
        // poll until done
        let txInfo = await (this.signer as FireblocksSigner).fireblocks.transactions.getTransaction({ txId: id! });
        while (txInfo.data.status !== TransactionStateEnum.Completed) {
          if (
            txInfo.data.status === TransactionStateEnum.Cancelled ||
            txInfo.data.status === TransactionStateEnum.Cancelling ||
            txInfo.data.status === TransactionStateEnum.Failed ||
            txInfo.data.status === TransactionStateEnum.Rejected ||
            txInfo.data.status === TransactionStateEnum.Timeout
          ) {
            console.log(txInfo)
            throw new Error(`Fireblocks failure. Tx id ${id} ${txInfo.data.status}`);
          }
          txInfo = await (this.signer as FireblocksSigner).fireblocks.transactions.getTransaction({ txId: id! });
          await new Promise((res) => setTimeout(res, 500));
        }

        const signature = txInfo.data.signedMessages?.[0]?.signature;
        if (!signature) {
          throw new Error("No signature returned from Fireblocks");
        }

        const encodedSig = '0x'+ signature?.r! + signature?.s + Buffer.from([Number.parseInt(signature.v!.toString(),16)]).toString("hex");
        xSignature = encodedSig || ''

      } else {
        if (isDomainSignType) {
          xSignature = await signer.signTypedData(domain, types, message)
        } else {
          xSignature = await signer.signMessage(xMessage)
        }
      }

      this.setHeaders({
        'x-timestamp': xTimestamp,
        'x-signature': xSignature,    
      })
    } else {
      this.setHeaders({})
    }

    const response = await fetch(this.rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.headers,
      },
      body: JSON.stringify(payload),
    })

    const data: {
      jsonrpc: string
      id: number
      result?: unknown
      error?: {
        code: number
        message: string
        data?: unknown
      }
    } = await response.json()

    if (response.ok && !data.error) {
      return data.result
    } else {
      throw new Error(JSON.stringify(data.error))
    }
  }

  async clone(signer: ethers.Signer | FireblocksSigner): Promise<SilentDataRollupRPCProvider> {
    const network = await this.getNetwork()
    const provider = new SilentDataRollupRPCProvider(this.rpcUrl, network.name, Number(network.chainId), this.signMethods)
    provider.setSigner(signer)
    return provider
  }

}
