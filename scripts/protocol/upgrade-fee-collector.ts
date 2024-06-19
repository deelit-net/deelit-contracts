import { ethers, upgrades } from "hardhat";

const PROXY_ADDRESS = process.env.PROXY_ADDRESS;

async function main() {

    if (!PROXY_ADDRESS) {
        throw new Error("PROXY_ADDRESS is required");
    }

    // Deploy the contract using upgrades.deployProxy
    const feeCollectorfactory = await ethers.getContractFactory("FeeCollector");
    const feeCollector = await upgrades.upgradeProxy(PROXY_ADDRESS, feeCollectorfactory)
    const feeCollectorAddress = await feeCollector.getAddress();

    console.log(`FeeCollector deployed at: ${feeCollectorAddress}`);
  
  }
  
  main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });