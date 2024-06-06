import { ethers, upgrades } from "hardhat";
import { LibFee } from "../typechain-types/contracts/DeelitProtocol";

const FEE_COLLECTOR_ADDRESS = process.env.FEE_COLLECTOR_ADDRESS;

async function main() {
  if (!FEE_COLLECTOR_ADDRESS) {
    throw new Error("FEE_COLLECTOR_ADDRESS is required");
  }

  const fees: LibFee.FeeStruct = {
    collector: FEE_COLLECTOR_ADDRESS,
    amount_bp: 1_00n, // 1%
  };

  // Deploy the contract using upgrades.deployProxy
  const deelitProtocolfactory =
    await ethers.getContractFactory("DeelitProtocol");
  const deelitProtocol = await upgrades.deployProxy(deelitProtocolfactory, [
    fees,
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
