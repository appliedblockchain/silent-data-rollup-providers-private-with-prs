import { Contract, ContractRunner, Interface, InterfaceAbi } from 'ethers'

export class SilentDataRollupContract extends Contract {
  constructor(
    address: string,
    abi: InterfaceAbi,
    runner: ContractRunner,
    contractMethodsToSign: string[]
  ) {
    /**
     * Validates that all methods specified for signing exist in the contract ABI.
     * This check ensures that only legitimate contract functions are marked for signing,
     * preventing potential errors or security issues from mistyped or non-existent methods.
     */
    const contractInterface = new Interface(abi)
    contractMethodsToSign.forEach((method) => {
      if (!contractInterface.hasFunction(method)) {
        throw new Error(
          `Method to sign '${method}' not found in the contract ABI`
        )
      }
    })

    /**
     * Maintain ethers.js compatibility by accepting a ContractRunner.
     *
     * If a provider is passed, the Contract cannot send transactions.
     * Clone our custom providers to allow setting this specific contract instance,
     * as the same provider might be used to instantiate different contracts.
     *
     * If a signer is passed, the Contract can send transactions.
     */
    if (typeof (runner as any).clone === 'function') {
      runner = (runner as any).clone()
    }

    super(address, abi, runner)

    const baseProvider =
      (runner as any).baseProvider || (runner as any).provider?.baseProvider

    if (typeof baseProvider?.setContract === 'function') {
      baseProvider.setContract(this, contractMethodsToSign)
    }
  }
}
