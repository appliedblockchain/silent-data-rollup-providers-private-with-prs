import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useContractConfig } from './useContractConfig';
import { useNonce } from './useNonce'
import { useCallback } from 'react'

type UseReadCounterOptions = {
  watch?: boolean
  refetchInterval?: number
}

export function useCounter() {
  const { contractAddress, abi } = useContractConfig()
  const { writeContractAsync } = useWriteContract()
  const { nonce } = useNonce()
  const { address } = useAccount()

  const writeCounter = useCallback(async (functionName: string) => {
    if (!contractAddress || !abi || !address) return;

    await writeContractAsync({
      address: contractAddress,
      abi,
      functionName,
      nonce
    });
  }, [contractAddress, abi, address, writeContractAsync, nonce])

  return {
    writeCounter
  };
}

export function useReadCounter(functionName: string, {
  watch = false,
  refetchInterval = 5_000
}: UseReadCounterOptions = {}) {
  const { contractAddress, abi } = useContractConfig();
  return useReadContract({
    address: contractAddress,
    abi,
    functionName,
    query: {
      enabled: !!contractAddress && !!abi,
      ...(watch ? { refetchInterval } : {}),
      retry: false
    },
    
  })
}

export function useCount(options: UseReadCounterOptions = {}) {
  const { address } = useAccount()
  const { data: count, isError } = useReadCounter('getCountPrivate', options)

  const hasCount = count !== undefined && count !== null && !isError && address !== undefined

  return hasCount ? (count as bigint)?.toString() : '-';
}

export function useOwner(options: UseReadCounterOptions = {}) {
  const { data: owner } = useReadCounter('getOwner', options)

  return owner ? owner as string : '-';
}
