const hre = require("hardhat");
const OnchainID = require('@onchain-id/solidity');
const ethers = require('ethers');

async function main() {
  try {
    const startDate = new Date();
    const deploy = await deployFullSuiteFixture()
    console.log(deploy);
    const endDate   = new Date();
    const seconds = (endDate.getTime() - startDate.getTime()) / 1000;
    console.log("Took ", seconds, " to deploy full suite of ERC-3643")
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();

async function deployIdentityProxy(implementationAuthority, managementKey, signer) {
  const identity = await hre.ethers_sdr.getContractFactory(OnchainID.contracts.IdentityProxy.abi, OnchainID.contracts.IdentityProxy.bytecode, signer);
  const deployIdentity = await identity.deploy(
    implementationAuthority,
    managementKey,
  );
  await deployIdentity.waitForDeployment()
  
  return hre.ethers_sdr.getContractAt('Identity', await deployIdentity.getAddress(), signer);
}


async function deployFullSuiteFixture() {
  const [deployer, tokenIssuer, tokenAgent, tokenAdmin, claimIssuer, aliceWallet, bobWallet, charlieWallet, davidWallet, anotherWallet] =
    await hre.ethers_sdr.getSigners();
  const claimIssuerSigningKey = ethers.Wallet.createRandom();
  const aliceActionKey = ethers.Wallet.createRandom();

  console.log('Before deploying implementations...')
  // Deploy implementations
  const claimTopicsRegistryImplementation = await hre.ethers_sdr.deployContract('ClaimTopicsRegistry', deployer);
  await claimTopicsRegistryImplementation.waitForDeployment();
  console.log("ClaimTopicsRegistry deployed...")
  const trustedIssuersRegistryImplementation = await hre.ethers_sdr.deployContract('TrustedIssuersRegistry', deployer);
  await trustedIssuersRegistryImplementation.waitForDeployment();
  console.log("TrustedIssuersRegistry deployed...")
  const identityRegistryStorageImplementation = await hre.ethers_sdr.deployContract('IdentityRegistryStorage', deployer);
  await identityRegistryStorageImplementation.waitForDeployment();
  console.log("IdentityRegistryStorage deployed...")
  const identityRegistryImplementation = await hre.ethers_sdr.deployContract('IdentityRegistry', deployer);
  await identityRegistryImplementation.waitForDeployment();
  console.log("IdentityRegistry deployed...")
  const modularComplianceImplementation = await hre.ethers_sdr.deployContract('ModularCompliance', deployer);
  await modularComplianceImplementation.waitForDeployment();
  console.log("ModularCompliance deployed...")
  const tokenImplementation = await hre.ethers_sdr.deployContract('Token', deployer);
  await tokenImplementation.waitForDeployment();
  console.log('After deploying implementations.')

  const identityImplementation = await new hre.ethers_sdr.ContractFactory(
    OnchainID.contracts.Identity.abi,
    OnchainID.contracts.Identity.bytecode,
    deployer,
  ).deploy(await deployer.getAddress(), true);
  await identityImplementation.waitForDeployment();
  console.log('After deploying identity.')
  const identityImplementationAuthority = await new hre.ethers_sdr.ContractFactory(
    OnchainID.contracts.ImplementationAuthority.abi,
    OnchainID.contracts.ImplementationAuthority.bytecode,
    deployer,
  ).deploy(await identityImplementation.getAddress());
  await identityImplementationAuthority.waitForDeployment();
  console.log('After deploying identity authority.')
  const identityFactory = await new hre.ethers_sdr.ContractFactory(OnchainID.contracts.Factory.abi, OnchainID.contracts.Factory.bytecode, deployer).deploy(
    await identityImplementationAuthority.getAddress(),
  );
  await identityFactory.waitForDeployment();


  console.log('After deploying identity factory.')
  const trexImplementationAuthority = await hre.ethers_sdr.deployContract(
    'TREXImplementationAuthority',
    [true, ethers.constants.AddressZero, ethers.constants.AddressZero],
    deployer,
  );
  await trexImplementationAuthority.waitForDeployment();
  console.log('After deploying trex authority.')
  const versionStruct = {
    major: 4,
    minor: 0,
    patch: 0,
  };
  const contractsStruct = {
    tokenImplementation: await tokenImplementation.getAddress(),
    ctrImplementation: await claimTopicsRegistryImplementation.getAddress(),
    irImplementation: await identityRegistryImplementation.getAddress(),
    irsImplementation: await identityRegistryStorageImplementation.getAddress(),
    tirImplementation: await trustedIssuersRegistryImplementation.getAddress(),
    mcImplementation: await modularComplianceImplementation.getAddress(),
  };
  await hre.ethers_sdr.connect(trexImplementationAuthority, deployer).addAndUseTREXVersion(versionStruct, contractsStruct);

  const trexFactory = await hre.ethers_sdr.deployContract('TREXFactory', [await trexImplementationAuthority.getAddress(), await identityFactory.getAddress()], deployer);
  await trexFactory.waitForDeployment();
  console.log('After deploying trex factory.')

  await hre.ethers_sdr.connect(identityFactory, deployer).addTokenFactory(await trexFactory.getAddress());

  const claimTopicsRegistry = await hre.ethers
    .deployContract('ClaimTopicsRegistryProxy', [await trexImplementationAuthority.getAddress()], deployer)
    .then(async (proxy) => {
      await proxy.waitForDeployment();
      return hre.ethers_sdr.getContractAt('ClaimTopicsRegistry', await proxy.getAddress())
    });
  console.log('After deploying claim topics registry.')

  const trustedIssuersRegistry = await hre.ethers
    .deployContract('TrustedIssuersRegistryProxy', [await trexImplementationAuthority.getAddress()], deployer)
    .then(async (proxy) => { 
      await proxy.waitForDeployment();
      return hre.ethers_sdr.getContractAt('TrustedIssuersRegistry', await proxy.getAddress())
    });
  console.log('After deploying trusted issuers registry.')
  
  const identityRegistryStorage = await hre.ethers
    .deployContract('IdentityRegistryStorageProxy', [await trexImplementationAuthority.getAddress()], deployer)
    .then(async (proxy) => {
      await proxy.waitForDeployment();
      return hre.ethers_sdr.getContractAt('IdentityRegistryStorage', await proxy.getAddress());
    });
  console.log('After deploying identity registry storage.')

  const defaultCompliance = await hre.ethers_sdr.deployContract('DefaultCompliance', deployer);
  await defaultCompliance.waitForDeployment()
  console.log('After deploying default compliance.')

  const identityRegistry = await hre.ethers
    .deployContract(
      'IdentityRegistryProxy',
      [await trexImplementationAuthority.getAddress(), await trustedIssuersRegistry.getAddress(), await claimTopicsRegistry.getAddress(), await identityRegistryStorage.getAddress()],
      deployer,
    )
    .then(async (proxy) => {
      await proxy.waitForDeployment();
      return hre.ethers_sdr.getContractAt('IdentityRegistry', await proxy.getAddress())
    });
  console.log('After deploying identity registry.')

  const tokenOID = await deployIdentityProxy(await identityImplementationAuthority.getAddress(), await tokenIssuer.getAddress(), deployer);
  const tokenName = 'TREXDINO';
  const tokenSymbol = 'TREX';
  const tokenDecimals = BigInt("0");
  const token = await hre.ethers
    .deployContract(
      'TokenProxy',
      [
        await trexImplementationAuthority.getAddress(),
        await identityRegistry.getAddress(),
        await defaultCompliance.getAddress(),
        tokenName,
        tokenSymbol,
        tokenDecimals,
        await tokenOID.getAddress(),
      ],
      deployer,
    )
    .then(async (proxy) => {
      await proxy.waitForDeployment();
      return hre.ethers_sdr.getContractAt('Token', await proxy.getAddress())
    });
  console.log('After deploying token proxy.')

  const agentManager = await hre.ethers_sdr.deployContract('AgentManager', [await token.getAddress()], tokenAgent);
  await agentManager.waitForDeployment();
  console.log('After deploying agent manager.')

  await hre.ethers_sdr.connect(identityRegistryStorage, deployer).bindIdentityRegistry(await identityRegistry.getAddress());
  console.log('After binding registry.')

  await hre.ethers_sdr.connect(token, deployer).addAgent(await tokenAgent.getAddress());
  console.log('After adding agent.')

  const claimTopics = [ethers.utils.id('CLAIM_TOPIC')];
  await hre.ethers_sdr.connect(claimTopicsRegistry, deployer).addClaimTopic(claimTopics[0]);
  console.log('After adding claim topic.')

  const claimIssuerContract = await hre.ethers_sdr.deployContract('ClaimIssuer', [await claimIssuer.getAddress()], claimIssuer);
  await claimIssuerContract.waitForDeployment();
  console.log('After deploying claim issuer contract.')

  await hre.ethers_sdr.connect(claimIssuerContract, claimIssuer)
    .addKey(ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['address'], [await claimIssuerSigningKey.getAddress()])), 3, 1);
  console.log('After adding key.')

  await hre.ethers_sdr.connect(trustedIssuersRegistry, deployer).addTrustedIssuer(await claimIssuerContract.getAddress(), claimTopics);
  console.log('After adding trusted issuer.')

  const aliceIdentity = await deployIdentityProxy(await identityImplementationAuthority.getAddress(), await aliceWallet.getAddress(), deployer);
  console.log('After deploying identity proxy alice.')

  const aliceIdentityWithSigner = await hre.ethers_sdr.getContractAt('Identity', await aliceIdentity.getAddress(), aliceWallet)
  await aliceIdentityWithSigner.addKey(ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['address'], [await aliceActionKey.getAddress()])), 2, 1);
  console.log('After adding key with Alice signer.')

  const bobIdentity = await deployIdentityProxy(await identityImplementationAuthority.getAddress(), await bobWallet.getAddress(), deployer);
  console.log('After deploying identity proxy bob.')
  const charlieIdentity = await deployIdentityProxy(await identityImplementationAuthority.getAddress(), await charlieWallet.getAddress(), deployer);
  console.log('After deploying identity proxy charlie.')

  const identityRegistry1 = await hre.ethers_sdr.getContractAt('IdentityRegistry', await identityRegistry.getAddress(), deployer);
  await identityRegistry1.addAgent(await tokenAgent.getAddress());
  
  const identityRegistry2 = await hre.ethers_sdr.getContractAt('IdentityRegistry', await identityRegistry.getAddress(), deployer);
  await identityRegistry2.addAgent(await token.getAddress());

  const identityRegistry3 = await hre.ethers_sdr.getContractAt('IdentityRegistry', await identityRegistry.getAddress(), tokenAgent);
  await identityRegistry3.batchRegisterIdentity([await aliceWallet.getAddress(), await bobWallet.getAddress()], [await aliceIdentity.getAddress(), await bobIdentity.getAddress()], [42, 666]);
  console.log('After batch register identity.')

  const claimForAlice = {
    data: ethers.utils.hexlify(ethers.utils.toUtf8Bytes('Some claim public data.')),
    issuer: await claimIssuerContract.getAddress(),
    topic: claimTopics[0],
    scheme: 1,
    identity: await aliceIdentity.getAddress(),
    signature: '',
  };
  claimForAlice.signature = await claimIssuerSigningKey.signMessage(
    ethers.utils.arrayify(
      ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['address', 'uint256', 'bytes'], [claimForAlice.identity, claimForAlice.topic, claimForAlice.data]),
      ),
    ),
  );

  console.log("Adding alice identity claim")
  const aliceIdentityAddClaim = await hre.ethers_sdr.getContractAt('Identity', await aliceIdentity.getAddress(), aliceWallet);
  await aliceIdentityAddClaim.addClaim(claimForAlice.topic, claimForAlice.scheme, claimForAlice.issuer, claimForAlice.signature, claimForAlice.data, '');

  const claimForBob = {
    data: ethers.utils.hexlify(ethers.utils.toUtf8Bytes('Some claim public data.')),
    issuer: await claimIssuerContract.getAddress(),
    topic: claimTopics[0],
    scheme: 1,
    identity: await bobIdentity.getAddress(),
    signature: '',
  };
  claimForBob.signature = await claimIssuerSigningKey.signMessage(
    ethers.utils.arrayify(
      ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['address', 'uint256', 'bytes'], [claimForBob.identity, claimForBob.topic, claimForBob.data]),
      ),
    ),
  );


  console.log('Adding claim')
  const identityBob = await hre.ethers_sdr.getContractAt('Identity', await bobIdentity.getAddress(), bobWallet);
  await identityBob.addClaim(claimForBob.topic, claimForBob.scheme, claimForBob.issuer, claimForBob.signature, claimForBob.data, '');
  console.log('Minting alice')
  const tokenAgentWithSigner = await hre.ethers_sdr.getContractAt('Token', await token.getAddress(), tokenAgent);
  await tokenAgentWithSigner.mint(await aliceWallet.getAddress(), 1000);
  console.log('Minting bob')
  const tokenAgentWithSigner2 = await hre.ethers_sdr.getContractAt('Token', await token.getAddress(), tokenAgent);
  await tokenAgentWithSigner2.mint(await bobWallet.getAddress(), 500);
  console.log('Add agent admin')
  const agentManagerWithSigner = await hre.ethers_sdr.getContractAt('AgentManager', await agentManager.getAddress(), tokenAgent);
  await agentManagerWithSigner.addAgentAdmin(await tokenAdmin.getAddress());
  console.log('Add agent token')
  const tokenWithSigner = await hre.ethers_sdr.getContractAt('Token', await token.getAddress(), deployer);
  await tokenWithSigner.addAgent(await agentManager.getAddress());
  console.log('Add agent identity')
  const identityWithSigner = await hre.ethers_sdr.getContractAt('IdentityRegistry', await identityRegistry.getAddress(), deployer);
  await identityWithSigner.addAgent(await agentManager.getAddress());
  console.log('Unpause')
  const tokenWithSignerAgent = await hre.ethers_sdr.getContractAt('Token', await token.getAddress(), tokenAgent);
  await tokenWithSignerAgent.unpause();
  console.log('Finish with success.')

  return {
    accounts: {
      deployer,
      tokenIssuer,
      tokenAgent,
      tokenAdmin,
      claimIssuer,
      claimIssuerSigningKey,
      aliceActionKey,
      aliceWallet,
      bobWallet,
      charlieWallet,
      davidWallet,
      anotherWallet,
    },
    identities: {
      aliceIdentity,
      bobIdentity,
      charlieIdentity,
    },
    suite: {
      claimIssuerContract,
      claimTopicsRegistry,
      trustedIssuersRegistry,
      identityRegistryStorage,
      defaultCompliance,
      identityRegistry,
      tokenOID,
      token,
      agentManager,
    },
    authorities: {
      trexImplementationAuthority,
      identityImplementationAuthority,
    },
    factories: {
      trexFactory,
      identityFactory,
    },
    implementations: {
      identityImplementation,
      claimTopicsRegistryImplementation,
      trustedIssuersRegistryImplementation,
      identityRegistryStorageImplementation,
      identityRegistryImplementation,
      modularComplianceImplementation,
      tokenImplementation,
    },
  };
}