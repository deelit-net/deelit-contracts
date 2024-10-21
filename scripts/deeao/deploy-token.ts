import { ethers, upgrades } from "hardhat";

const ACCESS_MANAGER_ADDRESS = process.env.ACCESS_MANAGER_ADDRESS;

async function main() {
  if (!ACCESS_MANAGER_ADDRESS) {
    throw new Error("ACCESS_MANAGER_ADDRESS is required");
  }

  const deeTokenFactory = await ethers.getContractFactory("DeeToken");
  const deeToken = await upgrades.deployProxy(deeTokenFactory, [
    ACCESS_MANAGER_ADDRESS,
  ]);
  const deeTokenAddress = await deeToken.getAddress();

  console.log(`DeeToken deployed at: ${deeTokenAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
