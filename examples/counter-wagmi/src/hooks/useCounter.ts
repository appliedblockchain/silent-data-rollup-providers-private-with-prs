import { useReadContract, useWriteContract } from 'wagmi';
import { useContractConfig } from './useContractConfig';
import { useNonce } from './useNonce'

export function useCounter() {
  const { contractAddress, abi } = useContractConfig();
  const { writeContractAsync } = useWriteContract();
  const { nonce } = useNonce()

  const increment = async () => {
    if (!contractAddress || !abi) return;

    await writeContractAsync({
      address: contractAddress,
      abi,
      functionName: 'increment',
      nonce
    });
  };

  const decrement = async () => {
    if (!contractAddress || !abi) return;

    await writeContractAsync({
      address: contractAddress,
      abi,
      functionName: 'decrement',
      nonce
    });
  };

  const reset = async () => {
    if (!contractAddress || !abi) return;

    await writeContractAsync({
      address: contractAddress,
      abi,
      functionName: 'reset',
      nonce
    });
  };

  return {
    increment,
    decrement,
    reset
  };
}

export function useCount({
  watch = false,
  refetchInterval = 5_000
}: {
  watch?: boolean
  refetchInterval?: number
} = {}) {
  const { contractAddress, abi } = useContractConfig();
  const { data: count } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'getCount',
    query: {
      enabled: !!contractAddress && !!abi,
      ...(watch ? { refetchInterval } : {})
    }
  });

  return count !== undefined && count !== null ? (count as bigint)?.toString() : '-';
}