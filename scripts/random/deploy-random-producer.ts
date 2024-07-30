import { ethers, upgrades } from "hardhat";
import { BaseContract } from "ethers";
import { RandomProducer } from "../../typechain-types";

const ACCESS_MANAGER_ADDRESS = process.env.ACCESS_MANAGER_ADDRESS;
const WRAPPER_ADDRESS = process.env.WRAPPER_ADDRESS;
const CALLBACK_GAS_LIMIT = process.env.CALLBACK_GAS_LIMIT;
const REQUEST_CONFIRMATIONS = process.env.REQUEST_CONFIRMATIONS;

async function main() {
  if (!ACCESS_MANAGER_ADDRESS) {
    throw new Error("ACCESS_MANAGER_ADDRESS is required");
  }
  if (!WRAPPER_ADDRESS) {
    throw new Error("WRAPPER_ADDRESS is required");
  }
  if (!CALLBACK_GAS_LIMIT) {
    throw new Error("CALLBACK_GAS_LIMIT is required");
  }
  if (!REQUEST_CONFIRMATIONS) {
    throw new Error("REQUEST_CONFIRMATIONS is required");
  }

  const factory = await ethers.getContractFactory("RandomProducer");
  const accessManager = (await upgrades.deployProxy(factory, [
    ACCESS_MANAGER_ADDRESS,
    WRAPPER_ADDRESS,
    BigInt(CALLBACK_GAS_LIMIT),
    BigInt(REQUEST_CONFIRMATIONS),
  ])) as BaseContract as RandomProducer;
  const accessManagerAddress = await accessManager.getAddress();

  console.log(`RandomProducer deployed at: ${accessManagerAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
