const hre = require("hardhat");
const OnchainID = require("@onchain-id/solidity");
const ethers = require("ethers");

async function main() {
  try {
    const startDate = new Date();
    const deploy = await deployFullSuiteFixture();
    const endDate = new Date();
    const seconds = (endDate.getTime() - startDate.getTime()) / 1000;
    console.log("Took ", seconds, " to deploy full suite of ERC-3643\n");

    const {
      suite: { token, identityRegistry, claimForBob },
      accounts: { deployer, aliceWallet, bobWallet, anotherWallet },
      identities: { bobIdentity },
      implementations: { modularComplianceImplementation },
    } = deploy;

    console.log("Starting Tests:\n");

    const privateModule = await hre.ethers.deployContract(
      "SupplyLimitModule",
      deployer
    );
    console.log("Deployed SupplyLimitModule");
    await privateModule.waitForDeployment();

    await hre.ethers.connect(modularComplianceImplementation, deployer).init();

    await hre.ethers
      .connect(modularComplianceImplementation, deployer)
      .addModule(await privateModule.getAddress());
    console.log("Added privateModule to ModularCompliance");

    await hre.ethers
      .connect(privateModule, deployer)
      .initialize(await modularComplianceImplementation.getAddress());
    console.log("Initialized privateModule, ensuring only MC can check it.");

    await hre.ethers
      .connect(token, deployer)
      .setCompliance(await modularComplianceImplementation.getAddress());

    console.log("Bound token contract to ModularCompliance.");

    try {
      await hre.ethers
        .connect(privateModule, deployer)
        .moduleCheck(
          await bobWallet.getAddress(),
          await aliceWallet.getAddress(),
          1,
          await modularComplianceImplementation.getAddress()
        );
    } catch (error) {
      console.log(
        "Trying to check the private module straight from any address other than the MC is unauthorized, as expected."
      );
    }

    const accessOIDwBob = await hre.ethers.getContractAt(
      "Identity",
      await bobIdentity.getAddress(),
      bobWallet
    );

    const claimId = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256"],
        [claimForBob.issuer, claimForBob.topic]
      )
    );

    try {
      await accessOIDwBob.getClaim(claimId);
    } catch (error) {
      console.log(
        "Trying to get a claim straight from an unauthorized address is not possible, as expected:"
      );
    }

    let tx = await hre.ethers
      .connect(token, aliceWallet)
      .approve(anotherWallet.address, 100);
    await tx.wait();

    let allowance = await hre.ethers
      .connect(token, aliceWallet)
      .allowance(aliceWallet.address, anotherWallet.address);

    console.log(
      "Starting a token transfer, which will require the configured contracts to call the functions for accessing modules and identity claims, which regular addresses were not allowed to."
    );

    tx = await hre.ethers
      .connect(token, aliceWallet)
      .transfer(bobWallet.address, 100);
    await tx.wait();
    console.log("Transferred 100 tokens from aliceWallet to bobWallet");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();

async function deployIdentityProxy(
  implementationAuthority,
  managementKey,
  signer
) {
  const identity = await hre.ethers.getContractFactory(
    OnchainID.contracts.IdentityProxy.abi,
    OnchainID.contracts.IdentityProxy.bytecode,
    signer
  );
  const deployIdentity = await identity.deploy(
    implementationAuthority,
    managementKey
  );
  await deployIdentity.waitForDeployment();

  return hre.ethers.getContractAt(
    "Identity",
    await deployIdentity.getAddress(),
    signer
  );
}

async function deployFullSuiteFixture() {
  const [
    deployer,
    tokenIssuer,
    tokenAgent,
    tokenAdmin,
    claimIssuer,
    aliceWallet,
    bobWallet,
    charlieWallet,
    davidWallet,
    anotherWallet,
  ] = await hre.ethers.getSigners();
  const claimIssuerSigningKey = ethers.Wallet.createRandom();
  const aliceActionKey = ethers.Wallet.createRandom();

  const claimTopicsRegistryImplementation = await hre.ethers.deployContract(
    "ClaimTopicsRegistry",
    deployer
  );
  await claimTopicsRegistryImplementation.waitForDeployment();
  console.log("Deployed ClaimTopicsRegistry.");
  const trustedIssuersRegistryImplementation = await hre.ethers.deployContract(
    "TrustedIssuersRegistry",
    deployer
  );
  await trustedIssuersRegistryImplementation.waitForDeployment();
  console.log("Deployed TrustedIssuersRegistry.");
  const identityRegistryStorageImplementation = await hre.ethers.deployContract(
    "IdentityRegistryStorage",
    deployer
  );
  await identityRegistryStorageImplementation.waitForDeployment();
  console.log("Deployed IdentityRegistryStorage.");
  const identityRegistryImplementation = await hre.ethers.deployContract(
    "IdentityRegistry",
    deployer
  );
  await identityRegistryImplementation.waitForDeployment();
  console.log("Deployed IdentityRegistry.");
  const modularComplianceImplementation = await hre.ethers.deployContract(
    "ModularCompliance",
    deployer
  );
  await modularComplianceImplementation.waitForDeployment();
  console.log("Deployed ModularCompliance.");
  const tokenImplementation = await hre.ethers.deployContract(
    "Token",
    deployer
  );
  await tokenImplementation.waitForDeployment();
  console.log("Deployed Token.");

  const identityImplementation = await new hre.ethers.ContractFactory(
    OnchainID.contracts.Identity.abi,
    OnchainID.contracts.Identity.bytecode,
    deployer
  ).deploy(await deployer.getAddress(), true);
  await identityImplementation.waitForDeployment();
  console.log("Deployed Identity.");
  const identityImplementationAuthority = await new hre.ethers.ContractFactory(
    OnchainID.contracts.ImplementationAuthority.abi,
    OnchainID.contracts.ImplementationAuthority.bytecode,
    deployer
  ).deploy(await identityImplementation.getAddress());
  await identityImplementationAuthority.waitForDeployment();
  console.log("Deployed IdentityAuthority.");
  const identityFactory = await new hre.ethers.ContractFactory(
    OnchainID.contracts.Factory.abi,
    OnchainID.contracts.Factory.bytecode,
    deployer
  ).deploy(await identityImplementationAuthority.getAddress());
  await identityFactory.waitForDeployment();

  console.log("Deployed IdentityFactory.");
  const trexImplementationAuthority = await hre.ethers.deployContract(
    "TREXImplementationAuthority",
    [true, ethers.constants.AddressZero, ethers.constants.AddressZero],
    deployer
  );
  await trexImplementationAuthority.waitForDeployment();
  console.log("Deployed TrexAuthority.");
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
  await hre.ethers
    .connect(trexImplementationAuthority, deployer)
    .addAndUseTREXVersion(versionStruct, contractsStruct);

  const trexFactory = await hre.ethers.deployContract(
    "TREXFactory",
    [
      await trexImplementationAuthority.getAddress(),
      await identityFactory.getAddress(),
    ],
    deployer
  );
  await trexFactory.waitForDeployment();
  console.log("Deployed TrexFactory.");

  await hre.ethers
    .connect(identityFactory, deployer)
    .addTokenFactory(await trexFactory.getAddress());

  const claimTopicsRegistry = await hre.ethers
    .deployContract(
      "ClaimTopicsRegistryProxy",
      [await trexImplementationAuthority.getAddress()],
      deployer
    )
    .then(async (proxy) => {
      await proxy.waitForDeployment();
      return hre.ethers.getContractAt(
        "ClaimTopicsRegistry",
        await proxy.getAddress()
      );
    });
  console.log("Deployed ClaimTopicsRegistry.");

  const trustedIssuersRegistry = await hre.ethers
    .deployContract(
      "TrustedIssuersRegistryProxy",
      [await trexImplementationAuthority.getAddress()],
      deployer
    )
    .then(async (proxy) => {
      await proxy.waitForDeployment();
      return hre.ethers.getContractAt(
        "TrustedIssuersRegistry",
        await proxy.getAddress()
      );
    });
  console.log("Deployed TrustedIssuersRegistry.");

  const identityRegistryStorage = await hre.ethers
    .deployContract(
      "IdentityRegistryStorageProxy",
      [await trexImplementationAuthority.getAddress()],
      deployer
    )
    .then(async (proxy) => {
      await proxy.waitForDeployment();
      return hre.ethers.getContractAt(
        "IdentityRegistryStorage",
        await proxy.getAddress()
      );
    });
  console.log("Deployed IdentityRegistryStorage.");

  const defaultCompliance = await hre.ethers.deployContract(
    "DefaultCompliance",
    deployer
  );
  await defaultCompliance.waitForDeployment();
  console.log("Deployed DefaultCompliance.");

  const identityRegistry = await hre.ethers
    .deployContract(
      "IdentityRegistryProxy",
      [
        await trexImplementationAuthority.getAddress(),
        await trustedIssuersRegistry.getAddress(),
        await claimTopicsRegistry.getAddress(),
        await identityRegistryStorage.getAddress(),
      ],
      deployer
    )
    .then(async (proxy) => {
      await proxy.waitForDeployment();
      return hre.ethers.getContractAt(
        "IdentityRegistry",
        await proxy.getAddress()
      );
    });
  console.log("Deployed IdentityRegistry.");

  const tokenOID = await deployIdentityProxy(
    await identityImplementationAuthority.getAddress(),
    await tokenIssuer.getAddress(),
    deployer
  );
  const tokenName = "TREXDINO";
  const tokenSymbol = "TREX";
  const tokenDecimals = BigInt("0");
  const token = await hre.ethers
    .deployContract(
      "TokenProxy",
      [
        await trexImplementationAuthority.getAddress(),
        await identityRegistry.getAddress(),
        await defaultCompliance.getAddress(),
        tokenName,
        tokenSymbol,
        tokenDecimals,
        await tokenOID.getAddress(),
      ],
      deployer
    )
    .then(async (proxy) => {
      await proxy.waitForDeployment();
      return hre.ethers.getContractAt("Token", await proxy.getAddress());
    });
  console.log("Deployed TokenProxy.");

  const agentManager = await hre.ethers.deployContract(
    "AgentManager",
    [await token.getAddress()],
    tokenAgent
  );
  await agentManager.waitForDeployment();
  console.log("Deployed AgentManager.");

  await hre.ethers
    .connect(identityRegistryStorage, deployer)
    .bindIdentityRegistry(await identityRegistry.getAddress());
  console.log("Binded registry.");

  await hre.ethers
    .connect(token, deployer)
    .addAgent(await tokenAgent.getAddress());
  console.log("Added agent.");

  const claimTopics = [ethers.utils.id("CLAIM_TOPIC")];
  await hre.ethers
    .connect(claimTopicsRegistry, deployer)
    .addClaimTopic(claimTopics[0]);
  console.log("Added claim topic.");

  const claimIssuerContract = await hre.ethers.deployContract(
    "ClaimIssuer",
    [await claimIssuer.getAddress()],
    claimIssuer
  );
  await claimIssuerContract.waitForDeployment();
  console.log("Deployed ClaimIssuer contract.");

  await hre.ethers
    .connect(claimIssuerContract, claimIssuer)
    .addKey(
      ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address"],
          [await claimIssuerSigningKey.getAddress()]
        )
      ),
      3,
      1
    );
  console.log("After adding key.");

  await hre.ethers
    .connect(trustedIssuersRegistry, deployer)
    .addTrustedIssuer(await claimIssuerContract.getAddress(), claimTopics);
  console.log("After adding trusted issuer.");

  const aliceIdentity = await deployIdentityProxy(
    await identityImplementationAuthority.getAddress(),
    await aliceWallet.getAddress(),
    deployer
  );

  const aliceIdentityWithSigner = await hre.ethers.getContractAt(
    "Identity",
    await aliceIdentity.getAddress(),
    aliceWallet
  );
  await aliceIdentityWithSigner.addKey(
    ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["address"],
        [await aliceActionKey.getAddress()]
      )
    ),
    2,
    1
  );
  console.log("After adding key with Alice signer.");

  const bobIdentity = await deployIdentityProxy(
    await identityImplementationAuthority.getAddress(),
    await bobWallet.getAddress(),
    deployer
  );
  console.log("Deployed identity proxy bob.");
  const charlieIdentity = await deployIdentityProxy(
    await identityImplementationAuthority.getAddress(),
    await charlieWallet.getAddress(),
    deployer
  );
  console.log("Deployed identity proxy charlie.");

  const identityRegistry1 = await hre.ethers.getContractAt(
    "IdentityRegistry",
    await identityRegistry.getAddress(),
    deployer
  );
  await identityRegistry1.addAgent(await tokenAgent.getAddress());

  const identityRegistry2 = await hre.ethers.getContractAt(
    "IdentityRegistry",
    await identityRegistry.getAddress(),
    deployer
  );
  await identityRegistry2.addAgent(await token.getAddress());

  const identityRegistry3 = await hre.ethers.getContractAt(
    "IdentityRegistry",
    await identityRegistry.getAddress(),
    tokenAgent
  );
  await identityRegistry3.batchRegisterIdentity(
    [await aliceWallet.getAddress(), await bobWallet.getAddress()],
    [await aliceIdentity.getAddress(), await bobIdentity.getAddress()],
    [42, 666]
  );
  console.log("After batch register identity.");

  const claimForAlice = {
    data: ethers.utils.hexlify(
      ethers.utils.toUtf8Bytes("Some claim public data.")
    ),
    issuer: await claimIssuerContract.getAddress(),
    topic: claimTopics[0],
    scheme: 1,
    identity: await aliceIdentity.getAddress(),
    signature: "",
  };
  claimForAlice.signature = await claimIssuerSigningKey.signMessage(
    ethers.utils.arrayify(
      ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256", "bytes"],
          [claimForAlice.identity, claimForAlice.topic, claimForAlice.data]
        )
      )
    )
  );

  console.log("Adding alice identity claim");
  const aliceIdentityAddClaim = await hre.ethers.getContractAt(
    "Identity",
    await aliceIdentity.getAddress(),
    aliceWallet
  );
  await aliceIdentityAddClaim.addClaim(
    claimForAlice.topic,
    claimForAlice.scheme,
    claimForAlice.issuer,
    claimForAlice.signature,
    claimForAlice.data,
    ""
  );

  await aliceIdentityAddClaim.authorizeEntity(identityRegistry1);
  await aliceIdentityAddClaim.authorizeEntity(identityRegistry2);
  await aliceIdentityAddClaim.authorizeEntity(identityRegistry3);

  console.log("Deployed identity proxy alice.");

  const claimForBob = {
    data: ethers.utils.hexlify(
      ethers.utils.toUtf8Bytes("Some claim public data.")
    ),
    issuer: await claimIssuerContract.getAddress(),
    topic: claimTopics[0],
    scheme: 1,
    identity: await bobIdentity.getAddress(),
    signature: "",
  };
  claimForBob.signature = await claimIssuerSigningKey.signMessage(
    ethers.utils.arrayify(
      ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256", "bytes"],
          [claimForBob.identity, claimForBob.topic, claimForBob.data]
        )
      )
    )
  );

  console.log("Adding claim");
  const identityBob = await hre.ethers.getContractAt(
    "Identity",
    await bobIdentity.getAddress(),
    bobWallet
  );
  await identityBob.addClaim(
    claimForBob.topic,
    claimForBob.scheme,
    claimForBob.issuer,
    claimForBob.signature,
    claimForBob.data,
    ""
  );

  await identityBob.authorizeEntity(identityRegistry1);
  await identityBob.authorizeEntity(identityRegistry2);
  await identityBob.authorizeEntity(identityRegistry3);

  console.log("Minting alice");
  const tokenAgentWithSigner = await hre.ethers.getContractAt(
    "Token",
    await token.getAddress(),
    tokenAgent
  );
  await tokenAgentWithSigner.mint(await aliceWallet.getAddress(), 1000);
  console.log("Minting bob");
  const tokenAgentWithSigner2 = await hre.ethers.getContractAt(
    "Token",
    await token.getAddress(),
    tokenAgent
  );
  await tokenAgentWithSigner2.mint(await bobWallet.getAddress(), 500);
  console.log("Add agent admin");
  const agentManagerWithSigner = await hre.ethers.getContractAt(
    "AgentManager",
    await agentManager.getAddress(),
    tokenAgent
  );
  await agentManagerWithSigner.addAgentAdmin(await tokenAdmin.getAddress());
  console.log("Add agent token");
  const tokenWithSignerDeployer = await hre.ethers.getContractAt(
    "Token",
    await token.getAddress(),
    deployer
  );
  await tokenWithSignerDeployer.addAgent(await agentManager.getAddress());
  console.log("Add agent identity");
  const identityWithSigner = await hre.ethers.getContractAt(
    "IdentityRegistry",
    await identityRegistry.getAddress(),
    deployer
  );
  await identityWithSigner.addAgent(await agentManager.getAddress());
  console.log("Unpause");
  const tokenWithSignerAgent = await hre.ethers.getContractAt(
    "Token",
    await token.getAddress(),
    tokenAgent
  );
  await tokenWithSignerAgent.unpause();
  console.log("Finish with success.");

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
      claimForBob,
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

async function deploySuiteWithModularCompliancesFixture() {
  const context = await loadFixture(deployFullSuiteFixture);

  const complianceProxy = await ethers.deployContract(
    "ModularComplianceProxy",
    [context.authorities.trexImplementationAuthority.address]
  );
  const compliance = await ethers.getContractAt(
    "ModularCompliance",
    complianceProxy.address
  );

  const complianceBeta = await ethers.deployContract("ModularCompliance");
  await complianceBeta.init();

  return {
    ...context,
    suite: {
      ...context.suite,
      compliance,
      complianceBeta,
    },
  };
}

async function deploySuiteWithModuleComplianceBoundToWallet() {
  const context = await loadFixture(deployFullSuiteFixture);

  const compliance = await ethers.deployContract("ModularCompliance");
  await compliance.init();

  const complianceModuleA = await ethers.deployContract("CountryAllowModule");
  await compliance.addModule(complianceModuleA.address);
  const complianceModuleB = await ethers.deployContract("CountryAllowModule");
  await compliance.addModule(complianceModuleB.address);

  await compliance.bindToken(context.accounts.charlieWallet.address);

  return {
    ...context,
    suite: {
      ...context.suite,
      compliance,
      complianceModuleA,
      complianceModuleB,
    },
  };
}
