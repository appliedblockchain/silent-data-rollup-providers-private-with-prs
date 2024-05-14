require("@nomicfoundation/hardhat-sdr");

task(
  "blockNumber",
  "Prints the current block number",
  async (_, { ethers }) => {
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log("Current block number: " + blockNumber);
  }
);

module.exports = {
  solidity: "0.8.21",
  defaultNetwork: "sdr",
  networks: {
    hardhat: {
    },
    sdr: {
      url: "https://test-rollup-dev.absd.app/{token}",
      accounts: ["{any_ethereum_wallet_private_key}"]
    }
  },
};

