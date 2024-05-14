import type EthersT from "ethers";
import type { HardhatEthersProvider as HardhatEthersProviderT } from "./hardhat-sdr-provider";
import "./extensions";
import { extendEnvironment } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";

import {
  getContractAt,
  getContractAtFromArtifact,
  getContractFactory,
  getContractFactoryFromArtifact,
  getImpersonatedSigner,
  getSigner,
  getSigners,
  deployContract,
} from "./helper";


extendEnvironment((hre) => {
  hre.ethers = lazyObject(() => {
    const { ethers } = require("ethers") as typeof EthersT;
    const { HardhatEthersProvider } = require("./hardhat-sdr-provider") as {
      HardhatEthersProvider: typeof HardhatEthersProviderT;
    };

    const provider = new HardhatEthersProvider(
      hre.network.provider,
      hre.network.name,
      (hre.config.networks[hre.config.defaultNetwork] as any)['url'],
      (hre.config.networks[hre.config.defaultNetwork] as any)['accounts'][0]
    );

    return {
      ...ethers,

      provider,

      getSigner: (address: string) => getSigner(hre, address),
      getSigners: () => getSigners(hre),
      getImpersonatedSigner: (address: string) =>
        getImpersonatedSigner(hre, address),
      // We cast to any here as we hit a limitation of Function#bind and
      // overloads. See: https://github.com/microsoft/TypeScript/issues/28582
      getContractFactory: getContractFactory.bind(null, hre) as any,
      getContractFactoryFromArtifact: (...args : any[]) => getContractFactoryFromArtifact(hre, ...(args as [any, any])),
      getContractAtFromArtifact: (...args : any[]) => getContractAtFromArtifact(hre, ...(args as [any, any, any])),
      getContractAt: (...args : any[]) => getContractAt(hre, ...(args as [any, any, any])),      
      deployContract: deployContract.bind(null, hre) as any,
    };
  });
});