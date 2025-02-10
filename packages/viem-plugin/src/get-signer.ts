import { getWalletClient, getAccount, Config } from '@wagmi/core'

export const getSigner = async (config: Config) => {
  const client = await getWalletClient(config)
  const account = await getAccount(config)

  if (!client || !account || !account.address) {
    // Using provider without a signer. This allows making requests without wallet connection
    return  
  }

	return {
    getAddress: async () => (account.address as string),
    signMessage: (message: string) => client.signMessage({ message }),
  }
}