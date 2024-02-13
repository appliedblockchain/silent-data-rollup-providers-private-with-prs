# Silent Data Rollup Quickstart

## Usage 

Install dependencies
```sh
yarn 
```

Copy the `.env-example` to `.env` and input the secrets (Check Section Environment Variables)
```sh
cp -a .env-example .env
```

Build the connector
```sh
yarn build 
or
yarn workspace connector build
```

Start the App
```sh
yarn start 
or
yarn workspace app start
```

### Example App Instructions

**Get Wallet Balance (ETH)**

Getting Wallet Balance (Allowed Scenario - Checking Balance for the same Wallet Address of the signer wallet)
```
$ yarn workspace app start

? What do you want to do? Get Wallet Balance (ETH)
Insert the private key of the wallet you want to use to sign your transaction
? Private Key:  <private-key-a>
Insert the wallet address that you want to check the balance
? Address:  0xE7871F89E2243c5A43d7590DB34139142f1009A0
Wallet Balance (ETH):  99.972975412915648719
```

Getting Wallet Balance (Fail Scenario - Checking Balance for a random Wallet Address different than signer wallet)
```
$ yarn workspace app start

? What do you want to do? Get Wallet Balance (ETH)
Insert the private key of the wallet you want to use to sign your transaction
? Private Key:  <private-key-a>
Insert the wallet address that you want to check the balance
? Address:  0x7643c4eF862aE84Eb7Aa1b2dCEd4a748f4dFA999
/home/ab/quick-start/silent-data-rollup-quickstart/connector/dist/src/provider.js:68
            throw new Error(JSON.stringify(data.error));
                  ^
Error: {"code":-78794,"message":"Unauthorised address recovered from x-signature","data":"Custom RPC"}
```

**Send ETH Transaction**

Sending ETH Transaction (Success Scenario - Funds available)

```
$ yarn workspace app start

? What do you want to do? Send ETH Transaction
Insert the private key of the wallet you want to use for signing your transaction
? Private Key:  <private-key-a>
? To Address: 0x7643c4eF862aE84Eb7Aa1b2dCEd4a748f4dFA999
? Value in ETH: 0.008
```

Sending ETH Transaction (Fail Scenario - Funds not available)

```
$ yarn workspace app start

? What do you want to do? Send ETH Transaction
Insert the private key of the wallet you want to use for signing your transaction
? Private Key:  <private-key-b>
? To Address: 0x7643c4eF862aE84Eb7Aa1b2dCEd4a748f4dFA999
? Value in ETH: 0.006
/home/ab/quick-start/silent-data-rollup-quickstart/connector/dist/src/provider.js:68
            throw new Error(JSON.stringify(data.error));
                  ^
Error: {"code":-32000,"message":"failed with 50000000 gas: insufficient funds for gas * price + value: address 0x63FaC9201494f0bd17B9892B9fae4d52fe3BD377 have 0 want 6000000000000000"}
```

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

## Environment Variables

- **RPC_URL**

    Should match the URL to access our Silent Data Rollup.

    ```
    https://<the-silent-data-node-url>/<your-token>
    ```

    To get the Provider RPC URL you should login at the provided frontend URL (using your account credentials). Then on the upper right corner open the menu and choose the 'Endpoints' menu item. Then select the first available one and the Provider RPC URL will be shown.

    To get your token, in the same view select the 'Security' tab and generate a new token.

- **NETWORK_NAME**

  Can be any name of your choosing, it's used by the SilentDataRollupRPCProvider constructor

- **CHAIN_ID**

  Should be the value 51966

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
const RPC_URL = 'https://custom-rpc-staging.silentdata.com/<your-auth-token>'
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
