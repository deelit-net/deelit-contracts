import { ethers, upgrades } from "hardhat";
import { LibFee } from "../../typechain-types/contracts/protocol/DeelitProtocol";

const ACCESS_MANAGER_ADDRESS = process.env.ACCESS_MANAGER_ADDRESS;
const FEE_RECIPIENT_ADDRESS = process.env.FEE_RECIPIENT_ADDRESS;
const FEE_AMOUNT = process.env.FEE_AMOUNT;

async function main() {
  if (!ACCESS_MANAGER_ADDRESS) {
    throw new Error("ACCESS_MANAGER_ADDRESS is required");
  }
  if (!FEE_RECIPIENT_ADDRESS) {
    throw new Error("FEE_RECIPIENT_ADDRESS is required");
  }
  if (!FEE_AMOUNT) {
    throw new Error("FEE_AMOUNT is required in basis points");
  }

  const fees: LibFee.FeeStruct = {
    recipient: FEE_RECIPIENT_ADDRESS,
    amount_bp: BigInt(FEE_AMOUNT),
  };

  // Deploy the contract using upgrades.deployProxy
  const deelitProtocolfactory =
    await ethers.getContractFactory("DeelitProtocol");
  const deelitProtocol = await upgrades.deployProxy(deelitProtocolfactory, [
    ACCESS_MANAGER_ADDRESS,
    fees
  ]);
  const deelitProtocolAddress = await deelitProtocol.getAddress();

  console.log(`DeelitProtocol deployed at: ${deelitProtocolAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
