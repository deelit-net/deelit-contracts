import { ethers } from "hardhat";
import { DeelitAccessManager } from "../../typechain-types";

const ACCESS_MANAGER_ADDRESS = process.env.ACCESS_MANAGER_ADDRESS;
const PROTOCOL_ADDRESS = process.env.PROTOCOL_ADDRESS;

const PAUSE_SELECTOR = "0x8456cb59";
const UNPAUSE_SELECTOR = "0x3f4ba83a";

const PAUSER_ROLE = 1n;

async function main() {
  if (!ACCESS_MANAGER_ADDRESS) {
    throw new Error("ACCESS_MANAGER_ADDRESS is required");
  }

  if (!PROTOCOL_ADDRESS) {
    throw new Error("PROTOCOL_ADDRESS is required");
  }

  const factory = await ethers.getContractFactory("DeelitAccessManager");
  const accessManager = (await factory.attach(
    ACCESS_MANAGER_ADDRESS,
  )) as DeelitAccessManager;

  await accessManager.setTargetFunctionRole(
    PROTOCOL_ADDRESS,
    [PAUSE_SELECTOR, UNPAUSE_SELECTOR],
    PAUSER_ROLE,
  );
  console.log(
    `Role PAUSER_ROLE ${PAUSER_ROLE} set to PROTOCOL ${PROTOCOL_ADDRESS}`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
