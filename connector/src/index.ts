import { SilentDataRollupRPCProvider } from "./provider";
import { ethers, TransactionReceipt } from "ethers";

const DEFAULT_SIGN_METHODS = [
  'eth_getTransactionByHash',
  'eth_getBalance',
  'eth_getTransactionCount',
  'eth_getProof',
  'eth_getTransactionReceipt',
  'eth_call',
]

const deployContract = async (deployer: ethers.Signer, abi: ethers.InterfaceAbi, bytecode: ethers.BytesLike, contractArgs: unknown[]) : Promise<ethers.BaseContract> => {
  const factory = new ethers.ContractFactory(
    abi,
    bytecode,
    deployer
  )
  return await factory.deploy(...contractArgs)
}

const getContract = async (contractAddress: string, abi: ethers.Interface | ethers.InterfaceAbi, signer?: ethers.Signer) : Promise<ethers.Contract> => {
  const contract = new ethers.Contract(
    contractAddress,
    abi,
    signer
  )
  return contract
}

// Awaits until transaction to be mined or fails when tries amount has been reached
const waitTransactionReceipt = async(providerArg: ethers.Provider, transactionHash: string, tries: number) : Promise<TransactionReceipt | null> => {
  let txReceipt : TransactionReceipt | null = null;
  let counter = 0;
  while (txReceipt === null || counter !== tries) {
    try {  
      await new Promise((resolve) => setTimeout(resolve, 1000))
      txReceipt = await providerArg.getTransactionReceipt(transactionHash);    
      if (txReceipt && txReceipt.blockNumber) {        
          return txReceipt;
      }
      counter++;
    } catch(e) {
      continue
    }
  }
  return null
}

export {
  getContract,
  deployContract,
  waitTransactionReceipt,
  SilentDataRollupRPCProvider,
  DEFAULT_SIGN_METHODS,
}
