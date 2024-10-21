import { ethers, upgrades } from "hardhat";

const ACCESS_MANAGER_ADDRESS = process.env.ACCESS_MANAGER_ADDRESS;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
const BASE_DELAY_SECONDS = process.env.BASE_DELAY_SECONDS;

async function main() {
  if (!ACCESS_MANAGER_ADDRESS) {
    throw new Error("ACCESS_MANAGER_ADDRESS is required");
  }

  if (!TOKEN_ADDRESS) {
    throw new Error("TOKEN_ADDRESS is required");
  }

  if (!BASE_DELAY_SECONDS) {
    throw new Error("BASE_DELAY_SECONDS is required");
  }

  const deeAOFactory = await ethers.getContractFactory("DeeAO");
  const deeAO = await upgrades.deployProxy(deeAOFactory, [
    TOKEN_ADDRESS,
    ACCESS_MANAGER_ADDRESS,
    BASE_DELAY_SECONDS,
  ]);
  const deeAOAddress = await deeAO.getAddress();

  console.log(`DeeAO deployed at: ${deeAOAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
