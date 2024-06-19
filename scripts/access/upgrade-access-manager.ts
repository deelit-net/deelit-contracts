import { ethers, upgrades } from "hardhat";

const PROXY_ADDRESS = process.env.PROXY_ADDRESS;

async function main() {

    if (!PROXY_ADDRESS) {
        throw new Error("PROXY_ADDRESS is required");
    }

    // Deploy the contract using upgrades.deployProxy
    const deelitAccessManagerfactory = await ethers.getContractFactory("DeelitAccessManager");
    const deelitAccessManager = await upgrades.upgradeProxy(PROXY_ADDRESS, deelitAccessManagerfactory)
    const deelitAccessManagerAddress = await deelitAccessManager.getAddress();

    console.log(`DeelitAccessManager deployed at: ${deelitAccessManagerAddress}`);
  
  }
  
  main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });