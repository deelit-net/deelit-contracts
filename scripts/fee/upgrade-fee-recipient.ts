import { ethers, upgrades } from "hardhat";

const PROXY_ADDRESS = process.env.PROXY_ADDRESS;

async function main() {

    if (!PROXY_ADDRESS) {
        throw new Error("PROXY_ADDRESS is required");
    }

    // Deploy the contract using upgrades.deployProxy
    const feeRecipientfactory = await ethers.getContractFactory("FeeRecipient");
    const feeRecipient = await upgrades.upgradeProxy(PROXY_ADDRESS, feeRecipientfactory)
    const feeRecipientAddress = await feeRecipient.getAddress();

    console.log(`FeeRecipient deployed at: ${feeRecipientAddress}`);
  
  }
  
  main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });