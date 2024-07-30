import { ethers, upgrades } from "hardhat";

const PROXY_ADDRESS = process.env.PROXY_ADDRESS;

async function main() {

    if (!PROXY_ADDRESS) {
        throw new Error("PROXY_ADDRESS is required");
    }

    // Deploy the contract using upgrades.deployProxy
    const lotteryfactory = await ethers.getContractFactory("Lottery");
    const lottery = await upgrades.upgradeProxy(PROXY_ADDRESS, lotteryfactory)
    const lotteryAddress = await lottery.getAddress();

    console.log(`Lottery deployed at: ${lotteryAddress}`);
  
  }
  
  main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });