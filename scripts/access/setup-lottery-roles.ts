import { ethers } from "hardhat";
import { DeelitAccessManager } from "../../typechain-types";

const ACCESS_MANAGER_ADDRESS = process.env.ACCESS_MANAGER_ADDRESS;
const LOTTERY_ADDRESS = process.env.LOTTERY_ADDRESS;

const REQUEST_RANDOM_WORD_SELECTOR = "0x0a01fb9e";
const RANDOM_CONSUMER_ROLE = 3n;

const PAUSE_SELECTOR = "0x8456cb59";
const UNPAUSE_SELECTOR = "0x3f4ba83a";

const PAUSER_ROLE = 1n;

async function main() {
  if (!ACCESS_MANAGER_ADDRESS) {
    throw new Error("ACCESS_MANAGER_ADDRESS is required");
  }

  if (!LOTTERY_ADDRESS) {
    throw new Error("LOTTERY_ADDRESS is required");
  }

  const factory = await ethers.getContractFactory("DeelitAccessManager");
  const accessManager = (await factory.attach(
    ACCESS_MANAGER_ADDRESS,
  )) as DeelitAccessManager;

  await accessManager.setTargetFunctionRole(
    LOTTERY_ADDRESS,
    [PAUSE_SELECTOR, UNPAUSE_SELECTOR],
    PAUSER_ROLE,
  );
  console.log(
    `Role PAUSER_ROLE ${PAUSER_ROLE} set to LOTTERY ${LOTTERY_ADDRESS}`,
  );

  await accessManager.setTargetFunctionRole(
    LOTTERY_ADDRESS,
    [REQUEST_RANDOM_WORD_SELECTOR],
    RANDOM_CONSUMER_ROLE,
  );
  console.log(
    `Role RANDOM_CONSUMER_ROLE ${RANDOM_CONSUMER_ROLE} set to LOTTERY ${LOTTERY_ADDRESS}`,
  );

  await accessManager.grantRole(RANDOM_CONSUMER_ROLE, LOTTERY_ADDRESS, 0n);
  console.log(
    `Role RANDOM_CONSUMER_ROLE ${RANDOM_CONSUMER_ROLE} granted to LOTTERY ${LOTTERY_ADDRESS}`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
