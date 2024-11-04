# Silent Data Rollup Hardhat Plugin Fireblocks Example

This repository demonstrates how to use the `@appliedblockchain/silentdatarollup-hardhat-plugin-fireblocks` with a Hardhat project. The example includes a basic smart contract deployment setup using Hardhat Ignition.

## Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- A Silent Data Rollup RPC URL
- A private key for deployment

## Getting Started

1. Clone this repository
2. Install dependencies: **`npm install`**
3. Configure environment variables **`cp .env-example .env`**
Edit `.env` and add your:
    - `RPC_URL`: Your Silent Data Rollup RPC endpoint
    - `FIREBLOCKS_API_KEY`: Your Fireblocks API key
    - `FIREBLOCKS_VAULT_ACCOUNT_ID`: Your Fireblocks vault account ID

## Configuration

The project is configured in `hardhat.config.ts` to use the Silent Data Rollup network:


## Smart Contract

The example includes a simple `PrivateToken.sol` contract that implements a privacy-focused ERC20 token with the following features:

- Implements the ERC20 standard interface
- Only allows token holders to view their own balance through the `balanceOf` method

## Deployment

The project uses Hardhat Ignition for deployments. The deployment module is configured in `ignition/modules/PrivateToken.ts`.

To deploy the contract:

```bash
npm run deploy
```

This will:

1. Compile the contract
2. Deploy it to the Silent Data Rollup network

## Development

### Available Scripts

- `npm run deploy` - Deploy the PrivateToken contract using Hardhat Ignition

### Project Dependencies

Main dependencies include:

- `@appliedblockchain/silentdatarollup-hardhat-plugin-fireblocks`: Enables Silent Data Rollup integration with Fireblocks
- `@nomicfoundation/hardhat-ignition-ethers`: Provides deployment management
- `hardhat`: The core development environment

## Additional Resources

- [SilentData Rollup Documentation](https://docs.silentdata.com)
- [Fireblocks Hardhat Plugin](https://developers.fireblocks.com/reference/hardhat-plugin)
- [Fireblocks Developer Documentation](https://developers.fireblocks.com/api)
- [Fireblocks Web3 Provider](https://developers.fireblocks.com/reference/evm-web3-provider)
- [Hardhat Ignition](https://hardhat.org/hardhat-runner/plugins/nomiclabs-hardhat-ignition)
