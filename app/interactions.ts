import { AddressLike, ethers } from 'ethers'
import {   
  waitTransactionReceipt,
  SilentDataRollupRPCProvider,
  DEFAULT_SIGN_METHODS,
  deployContract,
  getContract,
  FireblocksSigner
} from 'connector'

import PrivateTokenArtifact from "../contracts/compiled/PrivateToken.json";

const getETHBalance = async (provider: ethers.Provider, address: ethers.AddressLike) => {
  const balance = await provider.getBalance(address)
  console.log('Wallet Balance (ETH): ', ethers.formatEther(balance))
}

const sendTransaction = async (sender: ethers.Wallet, to: AddressLike, value: bigint) => {
  if(sender.provider === null){
    throw new Error("Signer not linked to provider")
  }
  
  const tx = await sender.sendTransaction({
    to: to,
    value: value,
  });
  await waitTransactionReceipt(sender.provider, tx.hash, 10)
  console.log("Transaction confirmed: ", tx.hash)

}

const deploy = async (deployer: ethers.Signer) => {

  if(deployer.provider === null){
    throw new Error('Deployer is not attached to Provider')
  }
  
  const provider = deployer.provider;
  const contract = await deployContract(deployer, 
    PrivateTokenArtifact.abi,
    PrivateTokenArtifact.bytecode,
    [8000000000])

  await waitTransactionReceipt(provider, contract.deploymentTransaction()?.hash || "", 10);
  const address = await contract.getAddress()
  console.log('Contract Deployed Address: ', address)
}

const getTokenBalance = async (contractAddress: string, signer: ethers.Signer, address: AddressLike) => {  
  const contract = await getContract(contractAddress, PrivateTokenArtifact.abi, signer)
  const res = await contract.balanceOf(address)
  console.log('Token Balance: ', res)
}

export {  
  getETHBalance,
  deploy,
  getTokenBalance,
  sendTransaction,
  SilentDataRollupRPCProvider,
  FireblocksSigner,
  DEFAULT_SIGN_METHODS
}
