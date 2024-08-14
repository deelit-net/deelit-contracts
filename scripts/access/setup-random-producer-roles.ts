import { ethers } from "hardhat";
import { DeelitAccessManager } from "../../typechain-types";

const ACCESS_MANAGER_ADDRESS = process.env.ACCESS_MANAGER_ADDRESS;
const RANDOM_PRODUCER_ADDRESS = process.env.RANDOM_PRODUCER_ADDRESS;

const REQUEST_RANDOM_WORD_SELECTOR = "0x0a01fb9e";
const RANDOM_CONSUMER_ROLE = 3n;

async function main() {
  if (!ACCESS_MANAGER_ADDRESS) {
    throw new Error("ACCESS_MANAGER_ADDRESS is required");
  }

  if (!RANDOM_PRODUCER_ADDRESS) {
    throw new Error("RANDOM_PRODUCER_ADDRESS is required");
  }

  const factory = await ethers.getContractFactory("DeelitAccessManager");
  const accessManager = (await factory.attach(
    ACCESS_MANAGER_ADDRESS,
  )) as DeelitAccessManager;

  await accessManager.setTargetFunctionRole(
    RANDOM_PRODUCER_ADDRESS,
    [REQUEST_RANDOM_WORD_SELECTOR],
    RANDOM_CONSUMER_ROLE,
  );
  console.log(
    `Set function REQUEST_RANDOM_WORD_SELECTOR ${REQUEST_RANDOM_WORD_SELECTOR} to RANDOM_CONSUMER_ROLE ${RANDOM_CONSUMER_ROLE} for RANDOM_PRODUCER ${RANDOM_PRODUCER_ADDRESS}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
