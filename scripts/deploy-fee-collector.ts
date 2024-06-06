import { ethers, upgrades } from "hardhat";

async function main() {
  const feeCollectorFactory = await ethers.getContractFactory("FeeCollector");
  const feeCollector = await upgrades.deployProxy(feeCollectorFactory);
  const feeCollectorAddress = await feeCollector.getAddress();

  console.log(`FeeCollector deployed at: ${feeCollectorAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
