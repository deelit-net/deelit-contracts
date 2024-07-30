import { ethers, upgrades } from "hardhat";

const PROXY_ADDRESS = process.env.PROXY_ADDRESS;

async function main() {

    if (!PROXY_ADDRESS) {
        throw new Error("PROXY_ADDRESS is required");
    }

    // Deploy the contract using upgrades.deployProxy
    const randomProducerfactory = await ethers.getContractFactory("RandomProducer");
    const randomProducer = await upgrades.upgradeProxy(PROXY_ADDRESS, randomProducerfactory)
    const randomProducerAddress = await randomProducer.getAddress();

    console.log(`RandomProducer deployed at: ${randomProducerAddress}`);
  
  }
  
  main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });