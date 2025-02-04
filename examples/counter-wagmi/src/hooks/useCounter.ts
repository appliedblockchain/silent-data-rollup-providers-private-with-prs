import { useReadContract, useWriteContract } from 'wagmi';
import { useContractConfig } from './useContractConfig';

export function useCounter() {
  const { contractAddress, abi } = useContractConfig();
  const { writeContractAsync } = useWriteContract();

  const increment = async () => {
    if (!contractAddress || !abi) return;

    await writeContractAsync({
      address: contractAddress,
      abi,
      functionName: 'increment'
    });
  };

  const decrement = async () => {
    if (!contractAddress || !abi) return;

    await writeContractAsync({
      address: contractAddress,
      abi,
      functionName: 'decrement'
    });
  };

  const reset = async () => {
    if (!contractAddress || !abi) return;

    await writeContractAsync({
      address: contractAddress,
      abi,
      functionName: 'reset'
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