const hre = require("hardhat");

async function main() {
  try {
    // Get the ContractFactory of your HelloWorld
    const HelloWorld = await hre.ethers.getContractFactory("HelloWorld");

    // Deploy the contract
    const contract = await HelloWorld.deploy();

    // Wait for the deployment transaction to be mined
    await contract.waitForDeployment();
    console.log(`HelloWorld deployed to: ${await contract.getAddress()}`);

    const saySomething = await contract.speak();  
    console.log("saySomething value:", saySomething);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();