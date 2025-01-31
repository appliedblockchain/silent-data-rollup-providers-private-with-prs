import {
  BaseConfig,
  NetworkName,
} from "@appliedblockchain/silentdatarollup-core";
import { JsonRpcApiProviderOptions, JsonRpcSigner, Signer } from "ethers";

// Create a custom signer that doesn't try to reconnect
export class CustomSigner extends JsonRpcSigner {
  connect(): CustomSigner {
    return this;
  }
}

export interface SilentDataRollupProviderConfig extends BaseConfig {
  rpcUrl: string;
  network?: NetworkName;
  chainId?: number;
  privateKey?: string;
  signer?: CustomSigner;
  options?: JsonRpcApiProviderOptions;
}
