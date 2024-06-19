import { ethers, upgrades } from "hardhat";
import { BaseContract } from "ethers";
import { DeelitAccessManager } from "../../typechain-types";

const INITIAL_ADMIN_ADDRESS = process.env.INITIAL_ADMIN_ADDRESS;

async function main() {
  if (!INITIAL_ADMIN_ADDRESS) {
    throw new Error("INITIAL_ADMIN_ADDRESS is required");
  }

  const factory = await ethers.getContractFactory("DeelitAccessManager");
  const accessManager = (await upgrades.deployProxy(factory, [INITIAL_ADMIN_ADDRESS] )) as BaseContract as DeelitAccessManager;
  const accessManagerAddress = await accessManager.getAddress();

  console.log(`DeelitAccessManager deployed at: ${accessManagerAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
