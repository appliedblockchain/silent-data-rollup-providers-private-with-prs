import {   
  waitTransactionReceipt,
  SilentDataRollupRPCProvider,
  deployContract,
  getContract,
  DEFAULT_SIGN_METHODS,
  FireblocksSigner
} from '../src/index'

import PrivateTokenArtifact from '../contracts/PrivateToken.json'
import { ethers } from 'ethers'
import 'dotenv/config'

import {
  Fireblocks
} from "@fireblocks/ts-sdk";

jest.mock('@fireblocks/ts-sdk', () => {
  return {
    TransactionOperation: {
      Raw: 'RAW_OPERATION',
    },
    TransferPeerPathType: {
      VaultAccount: 'VAULT_ACCOUNT'
    },
    TransactionStateEnum: {
      Completed: 'COMPLETED',
      Cancelled: 'CANCELLED',
      Cancelling: 'CANCELLING',
      Failed: 'FAILED',
      Rejected: 'REJECTED',
      Timeout: 'TIMEOUT'
    },
    Fireblocks: jest.fn().mockImplementation(() => {
      return {
        vaults: {
          getVaultAccountAssetAddressesPaginated: jest.fn(),
        },
        transactions: {
          createTransaction: jest.fn(),
          getTransaction: jest.fn()
        }
      };
    }),
  };
});

const RPC_URL = process.env.RPC_URL
const NETWORK_NAME = process.env.NETWORK_NAME
const CHAIN_ID = Number(process.env.CHAIN_ID)
const signerPK = process.env.SIGNER_PK
const otherAddressPK = process.env.OTHER_SIGNER_PK

if (!RPC_URL || !NETWORK_NAME || !CHAIN_ID || !signerPK || !otherAddressPK) {
  throw new Error('Missing env')
}

describe('Provider', () => {
  let provider: SilentDataRollupRPCProvider
  let providerOther: SilentDataRollupRPCProvider
  let signer: ethers.Wallet
  let otherSigner: ethers.Wallet
  let privateTokenContractAddress: string

  beforeAll(async () => {
    provider = new SilentDataRollupRPCProvider(RPC_URL, NETWORK_NAME, CHAIN_ID, DEFAULT_SIGN_METHODS)
    signer = new ethers.Wallet(signerPK, provider) 
    provider.setSigner(signer)   

    providerOther = new SilentDataRollupRPCProvider(RPC_URL, NETWORK_NAME, CHAIN_ID, DEFAULT_SIGN_METHODS)
    otherSigner = new ethers.Wallet(otherAddressPK, providerOther)
    providerOther.setSigner(otherSigner)

    expect(true).toBeTruthy()    
    expect(provider).toBeTruthy()
    expect(provider).toBeInstanceOf(SilentDataRollupRPCProvider)
    expect(providerOther).toBeTruthy()
    expect(providerOther).toBeInstanceOf(SilentDataRollupRPCProvider)
  })

  it('get my eth balance', async () => {
    const balance = await provider.getBalance(signer.address)
    expect(balance).toEqual(expect.any(BigInt))
  })

  it('get other account eth balance', async () => {
      await expect(provider.getBalance(otherSigner.address)).rejects.toMatchInlineSnapshot(`[Error: {"code":-78794,"message":"Unauthorised address recovered from x-signature","data":"Custom RPC"}]`)
  })

  it('tranfer eth', async () => {
    const providerOther = new SilentDataRollupRPCProvider(RPC_URL, NETWORK_NAME, CHAIN_ID, DEFAULT_SIGN_METHODS)
    const signerWalletOther = new ethers.Wallet(otherAddressPK, providerOther)
    providerOther.setSigner(signerWalletOther)
    
    const balanceBeforeTransfer = await providerOther.getBalance(signerWalletOther.address)
    const tx = await signer.sendTransaction({
      to: signerWalletOther.address,
      value: ethers.parseUnits('0.001', 'ether'),
    });
    await waitTransactionReceipt(provider, tx.hash, 5)
    const balanceAfterTransfer = await providerOther.getBalance(signerWalletOther.address)

    // Sent 0.001 ETH which is 1000000000000000 Wei
    expect(balanceAfterTransfer).toEqual(BigInt(balanceBeforeTransfer)+BigInt(1000000000000000))

  }, 10000)

  it('deploy private Token contract', async () => {    
    const contract = await deployContract(
      signer,
      PrivateTokenArtifact.abi,
      PrivateTokenArtifact.bytecode,
      [8000000000]
    )
    await provider.waitForTransaction(contract.deploymentTransaction()?.hash || "", 1);
    expect(contract).toBeTruthy()
    expect(contract).toBeInstanceOf(ethers.BaseContract)
    const address = await contract.getAddress()
    expect(address).toMatch(/^0x[0-9a-fA-F]{40}$/)
    privateTokenContractAddress = address
  }, 20000)

  it('getContract and call balanceOf with default signer', async () => {
    const contract = await getContract(
      privateTokenContractAddress,
      PrivateTokenArtifact.abi,
      signer
    )
    expect(contract).toBeTruthy()
    expect(contract).toBeInstanceOf(ethers.Contract)
    
    const res = await contract.balanceOf(signer)
    expect(res).toEqual(expect.any(BigInt))
  })

  it('getContract and call balanceOf with different signer', async () => {        
    const contract = await getContract(
      privateTokenContractAddress,
      PrivateTokenArtifact.abi,
      otherSigner
    )
    expect(contract).toBeTruthy()
    expect(contract).toBeInstanceOf(ethers.Contract)
    expect(contract.runner).toMatchObject({
      address: otherSigner.address,
      provider: expect.objectContaining({
        signer: expect.objectContaining({
          address: otherSigner.address,
        }),
      })
    })

    const res = await contract.balanceOf(otherSigner.address)
    expect(res).toEqual(expect.any(BigInt))
  })

  it('getContract and call balanceOf other account with default signer', async () => {
    const contract = await getContract(
      privateTokenContractAddress,
      PrivateTokenArtifact.abi,
      signer
    )
    expect(contract).toBeTruthy()
    expect(contract).toBeInstanceOf(ethers.Contract)
    expect(contract.runner).toMatchObject({
      address: signer.address,
      provider: expect.objectContaining({
        signer: expect.objectContaining({
          address: signer.address,
        }),
      })
    })
    await expect(contract.balanceOf(otherSigner.address)).rejects.toMatchInlineSnapshot(`[Error: {"code":3,"message":"execution reverted: PrivateToken: balance query for non-owner","data":"0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002950726976617465546f6b656e3a2062616c616e636520717565727920666f72206e6f6e2d6f776e65720000000000000000000000000000000000000000000000"}]`)
  })

  it('customize the sign methods', async () => {
    const signMethods: string[] | undefined = []

    provider = new SilentDataRollupRPCProvider(RPC_URL, NETWORK_NAME, CHAIN_ID, signMethods)
    const signerWallet = new ethers.Wallet(signerPK, provider)
    
    expect(true).toBeTruthy()
    
    expect(provider).toBeTruthy()
    expect(provider).toBeInstanceOf(SilentDataRollupRPCProvider)
    expect(provider.signMethods).toEqual(signMethods)

    const contract = await getContract(
      privateTokenContractAddress,
      PrivateTokenArtifact.abi,
      signerWallet
    )
    expect(contract).toBeTruthy()
    expect(contract).toBeInstanceOf(ethers.Contract)

    await expect(contract.balanceOf(signer)).rejects.toMatchInlineSnapshot(`[Error: {"code":3,"message":"execution reverted: PrivateToken: balance query for non-owner","data":"0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002950726976617465546f6b656e3a2062616c616e636520717565727920666f72206e6f6e2d6f776e65720000000000000000000000000000000000000000000000"}]`)      
  })

  describe('Fireblocks', () => {

    let fireblocks: Fireblocks

    const fireblocksVaultAccountId = 'testVaultId';
    const fireblocksAssetId = 'testAssetId';
  
    beforeEach(() => {
      fireblocks = new Fireblocks();
    });  
    
    it("get vault account asset addresses", async () => {
      const spy = jest
        .spyOn(fireblocks.vaults, "getVaultAccountAssetAddressesPaginated")
        .mockResolvedValue({
          statusCode: 200,
          headers: {},
          data: {
            addresses: [
              {
                assetId: "ETH_TEST5",
                address: "0x7f3c034a75136b9af07dD912FbCf2F80ad68EDef",
                description: "",
                tag: "",
                type: "Permanent",
                legacyAddress: "",
                enterpriseAddress: "",
                bip44AddressIndex: 0,
                userDefined: false,
              },
            ],
          },
        });

      let addresses = (
        await fireblocks.vaults.getVaultAccountAssetAddressesPaginated({
          vaultAccountId: fireblocksVaultAccountId,
          assetId: fireblocksAssetId,
        })
      ).data.addresses;

      expect(spy).toHaveBeenCalledWith({
        vaultAccountId: fireblocksVaultAccountId,
        assetId: fireblocksAssetId,
      });
      expect(addresses).toEqual([
        {
          assetId: "ETH_TEST5",
          address: "0x7f3c034a75136b9af07dD912FbCf2F80ad68EDef",
          description: "",
          tag: "",
          type: "Permanent",
          legacyAddress: "",
          enterpriseAddress: "",
          bip44AddressIndex: 0,
          userDefined: false,
        },
      ]);

    });

    it("sign a transaction", async () => { 

      const transactionId = 'transactionId';
      const signedMessage = {
        r: 'r_value',
        s: 's_value',
        v: 1
      };

      const spyCreateTransaction = jest.spyOn(fireblocks.transactions, "createTransaction").mockResolvedValue({
        statusCode: 200,
        headers: {},
        data: { id: transactionId }
      });

      const spyGetTransaction = jest.spyOn(fireblocks.transactions, "getTransaction").mockResolvedValue({
        statusCode: 200,
        headers: {},
        data: {
          status: 'COMPLETED',
          signedMessages: [{ signature: signedMessage }]
        }
      });

      const fireblocksSigner: FireblocksSigner = {
        fireblocks,
        assetId: fireblocksAssetId,
        vaultAccountId: fireblocksVaultAccountId
      }

      provider.setSigner(fireblocksSigner)

      await expect(provider.getBalance("0x7f3c034a75136b9af07dD912FbCf2F80ad68EDef")).rejects.toMatchInlineSnapshot(`[Error: {"code":-16098,"message":"invalid hex string","data":"Custom RPC"}]`)
      expect(spyCreateTransaction).toHaveBeenCalledTimes(1);
      expect(spyGetTransaction).toHaveBeenCalledTimes(1);
      expect(spyGetTransaction).toHaveBeenCalledWith({
        txId: transactionId
      });
      
    })

    it("sign a transaction but its rejected", async () => { 

      const transactionId = 'transactionId';

      const spyCreateTransaction = jest.spyOn(fireblocks.transactions, "createTransaction").mockResolvedValue({
        statusCode: 200,
        headers: {},
        data: { id: transactionId }
      });

      const spyGetTransaction = jest.spyOn(fireblocks.transactions, "getTransaction").mockResolvedValue({
        statusCode: 400,
        headers: {},
        data: {
          status: 'REJECTED',
        }
      });

      const fireblocksSigner: FireblocksSigner = {
        fireblocks,
        assetId: fireblocksAssetId,
        vaultAccountId: fireblocksVaultAccountId
      }

      provider.setSigner(fireblocksSigner)

      await expect(provider.getBalance("0x7f3c034a75136b9af07dD912FbCf2F80ad68EDef")).rejects.toMatchInlineSnapshot(`[Error: Fireblocks failure. Tx id transactionId REJECTED]`)
      expect(spyCreateTransaction).toHaveBeenCalledTimes(1);
      expect(spyGetTransaction).toHaveBeenCalledTimes(1);
      expect(spyGetTransaction).toHaveBeenCalledWith({
        txId: transactionId
      });

    })
  
  })

})
