import { ethers } from "hardhat";
import { BaseContract } from "ethers";
import { RandomProducer } from "../../typechain-types";

const ACCESS_MANAGER_ADDRESS = process.env.ACCESS_MANAGER_ADDRESS;
const COORDINATOR_ADDRESS = process.env.COORDINATOR_ADDRESS;
const SUBSCRIPTION_ID = process.env.SUBSCRIPTION_ID;
const GAS_LANE_KEY_HASH = process.env.GAS_LANE_KEY_HASH;
const CALLBACK_GAS_LIMIT = process.env.CALLBACK_GAS_LIMIT;
const REQUEST_CONFIRMATIONS = process.env.REQUEST_CONFIRMATIONS;

async function main() {
  if (!ACCESS_MANAGER_ADDRESS) {
    throw new Error("ACCESS_MANAGER_ADDRESS is required");
  }
  if (!COORDINATOR_ADDRESS) {
    throw new Error("COORDINATOR_ADDRESS is required");
  }
  if (!SUBSCRIPTION_ID) {
    throw new Error("SUBSCRIPTION_ID is required");
  }
  if (!GAS_LANE_KEY_HASH) {
    throw new Error("GAS_LANE_KEY_HASH is required");
  }
  if (!CALLBACK_GAS_LIMIT) {
    throw new Error("CALLBACK_GAS_LIMIT is required");
  }
  if (!REQUEST_CONFIRMATIONS) {
    throw new Error("REQUEST_CONFIRMATIONS is required");
  }

  const factory = await ethers.getContractFactory("RandomProducerChainlinkVRFv25");
  const randomProducer = await factory.deploy(ACCESS_MANAGER_ADDRESS,
    COORDINATOR_ADDRESS,
    SUBSCRIPTION_ID,
    GAS_LANE_KEY_HASH,
    CALLBACK_GAS_LIMIT,
    REQUEST_CONFIRMATIONS,
  );
  const randomProducerAddress = await randomProducer.getAddress();

  console.log(`RandomProducerChainlinkVRFv25 deployed at: ${randomProducerAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
