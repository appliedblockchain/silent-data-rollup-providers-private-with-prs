import "dotenv/config";

import { SignatureType } from "@appliedblockchain/silentdatarollup-core";
import "@nomicfoundation/hardhat-ignition-ethers";
import { HardhatUserConfig } from "hardhat/config";

import "@appliedblockchain/silentdatarollup-hardhat-plugin";

if (!process.env.RPC_URL) {
  throw new Error("RPC_URL environment variable is required");
}

if (!process.env.PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY environment variable is required");
}

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const config: HardhatUserConfig = {
  solidity: "0.8.22",
  defaultNetwork: "sdr",
  networks: {
    sdr: {
      url: RPC_URL,
      accounts: [PRIVATE_KEY], // Note: Currently, only one private key can be passed to the network accounts configuration.
      silentdata: {
        authSignatureType: SignatureType.Raw,
      },
    },
  },
};

export default config;
