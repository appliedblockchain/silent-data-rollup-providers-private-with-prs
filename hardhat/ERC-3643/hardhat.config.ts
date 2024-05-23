import '@xyrusworx/hardhat-solidity-json';
import '@nomicfoundation/hardhat-toolbox';
import { HardhatUserConfig } from 'hardhat/config';
import '@openzeppelin/hardhat-upgrades';
import 'solidity-coverage';
import '@nomiclabs/hardhat-solhint';
import '@primitivefi/hardhat-dodoc';
import '@nomicfoundation/hardhat-sdr';

const config: HardhatUserConfig = {
  defaultNetwork: "sdr",
  networks: {
    hardhat: {
    },
    sdr: {
      url: "https://test-rollup-dev.absd.app/0bea1ecb568400c882b7d2a363a340b9",
      accounts: ["8a859a6959105bfe5047434cefaa342dec638a29c35cb4fa91e91d012d24f041", "6f411113c43066f0473d58b1fd017ace4578ee4f839eab9b3b5f9e58e4dc168a", "8b17835937233f872dfd4539bdab0c51b85d2f195fd01e867af66b5fb0c63d8d", "0918712cdc8a2d01a0efff19461652da6b185c31e49ae2e58e20fa70833be836", "bdefcca45ca9aba3a4b0cb637d29114c8a5d3a61574d569b15fa3f95ab631fdf", "fc9ae866fdd29baed0ab8d47f5d684305a725db7d6d6afb4ffa604097d696949", "45391cd58ff37130da799e196d3ec2602302ac517cb6b7ca6e58cd081eb4e7de", "4afbeaf47443ed9b0bc837bde6a6d0dc46da786eb464d1c85b92f61be2e778ec", "9243426fa3d6e72836e925536afaf9fe6411fa777b6c9f6166adc1e609b0a7e9", "42ec11e65ce63ef510f32f06d2d83f38df928affbe0bb1dbbd22776ece4f499c", "4c73e19c885d87c1fea30997fc0c3a48f008c2130a6dd170166d8a9045347f7c"]
    }
  },
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  gasReporter: {
    enabled: true,
  },
  dodoc: {
    runOnCompile: false,
    debugMode: true,
    outputDir: "./docgen",
    freshOutput: true,
  },
};

export default config;
