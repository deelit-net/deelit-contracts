import { ethers, upgrades } from "hardhat";

const ACCESS_MANAGER_ADDRESS = process.env.ACCESS_MANAGER_ADDRESS;

async function main() {

  if (!ACCESS_MANAGER_ADDRESS) {
    throw new Error("ACCESS_MANAGER_ADDRESS is required");
  }

  const feeRecipientFactory = await ethers.getContractFactory("FeeRecipient");
  const feeRecipient = await upgrades.deployProxy(feeRecipientFactory, [ACCESS_MANAGER_ADDRESS]);
  const feeRecipientAddress = await feeRecipient.getAddress();

  console.log(`FeeRecipient deployed at: ${feeRecipientAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
