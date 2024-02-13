import { ethers } from 'ethers'
import fetch from 'node-fetch'

export class SilentDataRollupRPCProvider extends ethers.JsonRpcProvider implements ethers.Provider {
  private requestId = 0
  private readonly rpcUrl: string
  private signer: ethers.Signer | null = null
  private headers: Record<string, string> = {}
  public signMethods: string[] = []

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

  setSigner(signer: ethers.Signer) {
    this.signer = signer
  }

  setHeaders(headers: Record<string, string>) {
    this.headers = headers
  }

  setSignMethods(sign_methods: Array<string>) {
    this.signMethods = sign_methods
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
      const serialRequest = JSON.stringify(payload)
      const xMessage = serialRequest + xTimestamp
      const xSignature = await signer.signMessage(xMessage)
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

  async clone(signer: ethers.Signer): Promise<SilentDataRollupRPCProvider> {
    const network = await this.getNetwork()
    const provider = new SilentDataRollupRPCProvider(this.rpcUrl, network.name, Number(network.chainId), this.signMethods)
    provider.setSigner(signer)
    return provider
  }

}
