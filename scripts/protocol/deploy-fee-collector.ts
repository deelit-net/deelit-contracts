import { ethers, upgrades } from "hardhat";

const ACCESS_MANAGER_ADDRESS = process.env.ACCESS_MANAGER_ADDRESS;

async function main() {

  if (!ACCESS_MANAGER_ADDRESS) {
    throw new Error("ACCESS_MANAGER_ADDRESS is required");
  }

  const feeCollectorFactory = await ethers.getContractFactory("FeeCollector");
  const feeCollector = await upgrades.deployProxy(feeCollectorFactory, [ACCESS_MANAGER_ADDRESS]);
  const feeCollectorAddress = await feeCollector.getAddress();

  console.log(`FeeCollector deployed at: ${feeCollectorAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
