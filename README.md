# Silent Data Rollup Quickstart

### Dependencies

- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [nodejs 18.17.1(or latest)](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs)
- [npm](https://nodejs.org/en/learn/getting-started/an-introduction-to-the-npm-package-manager#introduction-to-npm)
- [yarn 3.6.3 (or latest)](https://classic.yarnpkg.com/lang/en/docs/install)
- [cast](https://book.getfoundry.sh/getting-started/installation)

Note: npm is part of nodejs installation, once you installed it you should have access to npm.

### Yarn Installation

- After installing nodejs v18.17.1 or greater version, use the following commands

```
npm install -g corepack
corepack enable
yarn -v
```

The last command will ask if you want to install Yarn and print the version, type 'Y' and proceed.


### Check dependencies are installed

Running the following commands should output the current version installed.
```
git --version
node -v
npm -v
yarn -v
cast --version
```

### Environment Variables Overview

- **RPC_URL**

    Should match the URL to access our Silent Data Rollup.

    ```
    https://<the-silent-data-node-url>/<your-token>
    ```

    To get the Provider RPC URL you should login at the provided frontend URL (using your account credentials). Then on the upper right corner open the menu and choose the 'Appchains' menu item. Then select the first available one and the Provider RPC URL will be shown.

    To get your token, in the same view select the 'Security' tab and generate a new token (in order to generate a new token you can press the button in the same panel to subscribe for a trial account).

- **NETWORK_NAME**

  Can be any name of your choosing, it's used by the SilentDataRollupRPCProvider constructor

- **CHAIN_ID**

  Should be the value 51966

- **FIREBLOCKS_API_KEY**

  To get the FIREBLOCKS_API_KEY you should go to the Fireblocks dashboard (https://sandbox.fireblocks.io/v2/developer/api-users) and create an api user (with editor role) with sign permissions. Download the private key file generated for the user. 

- **FIREBLOCKS_SECRET_KEY_PATH**

  The private key file generated for the api user created. Default value is `fireblocks_secret.key`
  The file should be copied and pasted in the `/app` folder


# Important: Environment Setup

1) Login at [Silent Data [Rollup]](https://rollup.silentdata.com/login) using your account.
2) On the dashboard, check the available appchain in the table (or click the option "view all" to go to see the complete list).
3) Click in the currently available 'Appchain' from the table.
4) Go to the Security tab and generate a new token.
5) Copy the generated token 
6) Create a copy of the **.env.example** file and name it **.env**
7) Open the created file **.env**
8) On the first variable named **RPC_URL**, just replace **&lt;your-token&gt;** with your actual token copied from step 5.

For Fireblocks
1) Signup/Login at https://www.fireblocks.com/
2) Go to Developer Center -> API users
3) Add a new user (select Editor Role)
4) Download the CSR private key file generated
5) Paste the file in the `/app` folder 
6) Check that the **FIREBLOCKS_SECRET_KEY_PATH** and the name of the file is the same

# Installation 

1) First you should clone the git repository by executing the following command:
```
git clone git@github.com:appliedblockchain/silent-data-rollup-quickstart.git
```

2) Open a terminal and from the project root folder execute the following command to install the project package dependencies.
```sh
yarn 
```

3) Build the quick-start application
```sh
yarn build 
```

4) Start the application
```sh
yarn start
```

# Usage Examples

To use the quickstart you should use your Ethereum Wallet or create a new one, for that purpose we will use **cast** marked as dependency on top of this README, to create a new Ethereum Wallet.

**Generate a new Ethereum Wallet**

```
cast wallet new
```
By running the cast command above you should now have a Private Key and Address for your new Ethereum Wallet.



**Deploy Private Token Balance**

Deploy Private Token Balance (Success Scenario - Funds available)

```
$ yarn workspace app start

? What do you want to do? Deploy Private Token Contract
Insert the private key of the wallet you want to use to sign your transaction
? Private Key:  <private-key-a>
Contract Deployed Address:  0x5b88FcC98F7fc340DeFb76bc8B51C0d387fC0759
```

**Get Token Balance**


Get Token Balance (Success Scenario - Authorized)

```
$ yarn workspace app start

? What do you want to do? Get Token Balance
Insert the private key of the wallet you want to use to sign your transaction
? Private Key:  <private-key-a>
Insert the address of the deployed contract
? Contract Address: 0x5b88FcC98F7fc340DeFb76bc8B51C0d387fC0759
Insert the wallet address that you want to use check the token balance
? Wallet Address: 0xE7871F89E2243c5A43d7590DB34139142f1009A0
Token Balance:  8000000000n
```


Get Token Balance (Fail Scenario - Not Authorized)

```
$ yarn workspace app start

? What do you want to do? Get Token Balance
Insert the private key of the wallet you want to use to sign your transaction
? Private Key:  <private-key-a>
Insert the address of the deployed contract
? Contract Address: 0x5b88FcC98F7fc340DeFb76bc8B51C0d387fC0759
Insert the wallet address that you want to use check the token balance
? Wallet Address: 0x7643c4eF862aE84Eb7Aa1b2dCEd4a748f4dFA999
/home/ab/quick-start/silent-data-rollup-quickstart/connector/dist/src/provider.js:68
            throw new Error(JSON.stringify(data.error));
                  ^
Error: {"code":3,"message":"execution reverted: PrivateToken: balance query for non-owner","data":"0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002950726976617465546f6b656e3a2062616c616e636520717565727920666f72206e6f6e2d6f776e65720000000000000000000000000000000000000000000000"}
```

## Troubleshooting

In case you receive an error with message **Token not found**:
- Be sure that you are using a valid token and your subscription hasn't reached the requests limit yet which can be confirmed on your [plan page](https://rollup.silentdata.com/organisation/plan)

## Structure
- `app` workspace 
- `connector` workspace (package)
- `contracts` (Private Token example)



## Test suite

  For running the tests you need the following extra environment variables.

  - **SIGNER_PK**

    This should match your ethereum wallet private key (in hexadecimal format) with available funds, example:
    ```
    0xae7bfc27a7a2ca432ca57fa6b6db36110e13acf471a5ec8420788b9c6b3ad718
    ```
  - **OTHER_SIGNER_PK**

    This can be any other ethereum wallet private key (in hexadecimal format), only important for running tests.

  ### Running tests

  ```
  yarn workspace connector test
  ```

## Connector usage

```ts
import {   
  deployContract, 
  getContract, 
  SilentDataRollupRPCProvider,
  DEFAULT_SIGN_METHODS
} from 'connector'
```



## Initialize the connector using SilentDataRollupRPCProvider constructor
```ts
// connection
const RPC_URL = 'https://testnet.silentdata.com/<your-auth-token>'
const NETWORK_NAME = 'SDR'
const CHAIN_ID = 51966

// Using the constructor
const provider = new SilentDataRollupRPCProvider(RPC_URL, NETWORK_NAME, CHAIN_ID, DEFAULT_SIGN_METHODS)
const signer = new ethers.Wallet(signerPK, provider)  
provider.setSigner(signer)
```

## Deploy a contract
```ts
await deployContract(
  signer,
  ContractArtifact.abi,
  ContractArtifact.bytecode,
  [...args]
)
```

## Get a contract
```ts
// with a signer (runner)
const contract = await getContract(
  CONTRACT_ADDRESS,
  ContractArtifact.abi,
  signer
)
// call contract method with signer
await contract.balanceOf(signer.address)
```

## Send wallet transaction
```ts
// send transaction
const tx = await signer.sendTransaction({
  to: '<send-to-address>',
  value: ethers.parseUnits('0.001', 'ether'),
});
```

## Using Fireblocks wallet
```ts
// config and init the fireblocks api sdk
const FIREBLOCKS_API_KEY = process.env.FIREBLOCKS_API_KEY;
const FIREBLOCKS_SECRET_KEY_PATH = process.env.FIREBLOCKS_SECRET_KEY_PATH;
const FIREBLOCKS_SECRET_KEY = readFileSync(resolve(FIREBLOCKS_SECRET_KEY_PATH!), "utf-8");

const fireblocks = new Fireblocks({
  apiKey: FIREBLOCKS_API_KEY,
  secretKey: FIREBLOCKS_SECRET_KEY,
  basePath: BasePath.Sandbox,
});

// create the fireblocks signer with the asset and account selected
const fireblocksSigner: FireblocksSigner = {
  fireblocks,
  assetId: fireblocksAssetId,
  vaultAccountId: fireblocksVaultAccountId
}
// set the fireblocks signer
provider.setSigner(fireblocksSigner)

let addresses = (await fireblocks.vaults.getVaultAccountAssetAddressesPaginated({
  vaultAccountId: fireblocksVaultAccountId,
  assetId: fireblocksAssetId
})).data.addresses

// get the wallet address to use based on the assetId and vaultAccountId selected
let wallet: string = ''
if (addresses && addresses.length > 0) {
  wallet = addresses[0].address as string
}

// use the getContract or any RPC interaction as usual with the VoidSigner 
const signer = new ethers.VoidSigner(wallet, provider)

```
