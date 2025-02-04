import { useCallback, useEffect, useState } from 'react'
import { Address } from 'viem'

// Add this type for the ABI
type ContractAbi = typeof import('../../contract.json')['abi']

interface UseContractConfigResult {
	contractAddress: Address | undefined
	abi: ContractAbi | undefined
	mounted: boolean
}

export function useContractConfig(): UseContractConfigResult {
	const [contractAddress, setContractAddress] = useState<Address | undefined>(undefined)
	const [mounted, setMounted] = useState(false)
	const [abi, setAbi] = useState<ContractAbi | undefined>(undefined)

  const fetchContractInfo = useCallback(async () => {
    const info = await import('../../contract.json')
    return info
  }, [])

	useEffect(() => {
		setMounted(true)
		fetchContractInfo().then((info) => {
			setContractAddress(info.address as Address)
			setAbi(info.abi)
		})
	}, [fetchContractInfo])

	return { contractAddress, abi, mounted }
} 

