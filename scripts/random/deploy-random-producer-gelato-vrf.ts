import { ethers } from "hardhat";
import { BaseContract } from "ethers";
import { RandomProducer } from "../../typechain-types";

const ACCESS_MANAGER_ADDRESS = process.env.ACCESS_MANAGER_ADDRESS;
const GELATO_OPERATO_ADDRESS = process.env.GELATO_OPERATO_ADDRESS;

async function main() {
  if (!ACCESS_MANAGER_ADDRESS) {
    throw new Error("ACCESS_MANAGER_ADDRESS is required");
  }
  if (!GELATO_OPERATO_ADDRESS) {
    throw new Error("GELATO_OPERATO_ADDRESS is required");
  }

  const factory = await ethers.getContractFactory("RandomProducerGelatoVRF");
  const randomProducer = await factory.deploy(ACCESS_MANAGER_ADDRESS,
    GELATO_OPERATO_ADDRESS
  );
  const randomProducerAddress = await randomProducer.getAddress();

  console.log(`RandomProducerGelatoVRF deployed at: ${randomProducerAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
