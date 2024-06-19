import { ethers, upgrades } from "hardhat";

const PROXY_ADDRESS = process.env.PROXY_ADDRESS;

async function main() {

    if (!PROXY_ADDRESS) {
        throw new Error("PROXY_ADDRESS is required");
    }

    // Deploy the contract using upgrades.deployProxy
    const deelitProtocolfactory = await ethers.getContractFactory("DeelitProtocol");
    const deelitProtocol = await upgrades.upgradeProxy(PROXY_ADDRESS, deelitProtocolfactory)
    const deelitProtocolAddress = await deelitProtocol.getAddress();

    console.log(`DeelitProtocol deployed at: ${deelitProtocolAddress}`);
  
  }
  
  main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });