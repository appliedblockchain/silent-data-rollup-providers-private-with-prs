import select from "@inquirer/select";
import input from '@inquirer/input';
import dotenv from "dotenv";
import { ethers } from "ethers";
dotenv.config({ path: "../.env" });
import { readFileSync } from "fs";
import { resolve } from 'path';

import { getETHBalance, deploy, getTokenBalance, sendTransaction, SilentDataRollupRPCProvider, DEFAULT_SIGN_METHODS, FireblocksSigner } from "./interactions";

import {
  BasePath,
  Fireblocks
} from "@fireblocks/ts-sdk";

const run = async () => {
  const RPC_URL = process.env.RPC_URL;
  const NETWORK_NAME = process.env.NETWORK_NAME;
  const CHAIN_ID = Number(process.env.CHAIN_ID);

  if (!RPC_URL || !NETWORK_NAME || !CHAIN_ID) {
    throw new Error("Missing env");
  }

  const answer = await select({
    message: "What do you want to do?",
    choices: [
      {
        name: "Print Configs",
        value: "print-configs",
        description: "print the current configs",
      },
      {
        name: "Get Wallet Balance (ETH)",
        value: "get-eth-balance",
        description: "get the wallet eth balance",
      },
      {
        name: "Send ETH Transaction",
        value: "send-eth",
        description: "send ETH using wallet transaction",
      },
      {
        name: "Get Token Balance",
        value: "token-balance",
        description: "get the signer token balance of a contract address",
      },
      {
        name: "Get Token Balance with Fireblocks",
        value: "token-balance-fireblocks",
        description: "get the signer token balance of a contract address using Fireblocks",
      },
      {
        name: "Deploy Private Token Contract",
        value: "deploy",
        description: "deploy a contract to the network",
      }
    ],
  });

  const provider = new SilentDataRollupRPCProvider(RPC_URL, NETWORK_NAME, CHAIN_ID, DEFAULT_SIGN_METHODS)

  switch (answer) {
    case "token-balance-fireblocks":

    const FIREBLOCKS_API_KEY = process.env.FIREBLOCKS_API_KEY;
    const FIREBLOCKS_SECRET_KEY_PATH = process.env.FIREBLOCKS_SECRET_KEY_PATH;
    const FIREBLOCKS_SECRET_KEY = readFileSync(resolve(FIREBLOCKS_SECRET_KEY_PATH!), "utf-8");
    
    const fireblocks = new Fireblocks({
      apiKey: FIREBLOCKS_API_KEY,
      secretKey: FIREBLOCKS_SECRET_KEY,
      basePath: BasePath.Sandbox,
    });

      console.log("Insert the asset ID")
      const fireblocksAssetId = await input({
        message: 'Asset ID:', 
        default: 'ETH_TEST5'
      });

      console.log("Insert the vault account ID")
      const fireblocksVaultAccountId = await input({
        message: 'Vault Account ID:', 
        default: '0'
      });
      
      let addresses = (await fireblocks.vaults.getVaultAccountAssetAddressesPaginated({
        vaultAccountId: fireblocksVaultAccountId,
        assetId: fireblocksAssetId
      })).data.addresses

      let wallet: string = ''
      if (addresses && addresses.length > 0) {
        wallet = addresses[0].address as string
      }
      console.log('Address: ', JSON.stringify(wallet, null, 2));

      console.log("Insert the address of the deployed contract")
      const contractAddressFireblocks = await input({
        message: 'Contract Address:',        
      });

      console.log("Insert the wallet address that you want to use check the token balance")
      const walletAddressFireblocks = await input({
        message: 'Wallet Address:',
        default: wallet
      });

      const fireblocksSigner: FireblocksSigner = {
        fireblocks,
        assetId: fireblocksAssetId,
        vaultAccountId: fireblocksVaultAccountId
      }
      provider.setSigner(fireblocksSigner)

      getTokenBalance(contractAddressFireblocks, new ethers.VoidSigner(wallet, provider), walletAddressFireblocks);

      break;
    case "print-configs":
      console.log({ RPC_URL, NETWORK_NAME, CHAIN_ID });
      break;
    case "get-eth-balance":
      console.log("Insert the private key of the wallet you want to use to sign your transaction")
      const privateKeyCheckBalance = await input({
        message: 'Private Key: '
      });

      console.log("Insert the wallet address that you want to check the balance")
      const walletAddressBalance = await input({
        message: 'Address: '
      });
      
      const signerForCheckBalance = new ethers.Wallet(privateKeyCheckBalance, provider)  
      provider.setSigner(signerForCheckBalance)

      getETHBalance(provider, walletAddressBalance);

      break;
    case "deploy":
      console.log("Insert the private key of the wallet you want to use to sign your transaction")
      const privateKeyForDeploy = await input({
        message: 'Private Key: '
      });
      
      const signerForDeploy = new ethers.Wallet(privateKeyForDeploy, provider)  
      provider.setSigner(signerForDeploy)

      deploy(signerForDeploy);

      break;
    case "token-balance":
      console.log("Insert the private key of the wallet you want to use to sign your transaction")
      const signerForTokenBalancePK = await input({
        message: 'Private Key: '
      });

      console.log("Insert the address of the deployed contract")
      const contractAddress = await input({
        message: 'Contract Address:',        
      });

      console.log("Insert the wallet address that you want to use check the token balance")
      const walletAddress = await input({
        message: 'Wallet Address:',        
      });
     
      const signerForTokenBalance = new ethers.Wallet(signerForTokenBalancePK, provider)  
      provider.setSigner(signerForTokenBalance)

      getTokenBalance(contractAddress, signerForTokenBalance, walletAddress);
      break;
    case "send-eth":
      console.log("Insert the private key of the wallet you want to use for signing your transaction")
      const signerPK = await input({
        message: 'Private Key: '
      });

      const toAddress = await input({
        message: 'To Address:'        
      });

      const value = await input({
        message: 'Value in ETH:',
        default: '0.001'     
      });

      const signerForSendTransaction = new ethers.Wallet(signerPK, provider)  
      provider.setSigner(signerForSendTransaction)

      sendTransaction(signerForSendTransaction, toAddress, ethers.parseUnits(value, 'ether'))
      break;
  }
};

run();
