import { ethers, upgrades } from "hardhat";
import { LibFee } from "../../typechain-types/contracts/lottery/Lottery";

const ACCESS_MANAGER_ADDRESS = process.env.ACCESS_MANAGER_ADDRESS;
const PROTOCOL_ADDRESS = process.env.PROTOCOL_ADDRESS;
const RANDOM_PRODUCER_ADDRESS = process.env.RANDOM_PRODUCER_ADDRESS;
const FEE_RECIPIENT_ADDRESS = process.env.FEE_RECIPIENT_ADDRESS;
const FEE_AMOUNT = process.env.FEE_AMOUNT;
const PROTOCOL_MINIMAL_VESTING_PERIOD = process.env.PROTOCOL_MINIMAL_VESTING_PERIOD;

async function main() {
  if (!ACCESS_MANAGER_ADDRESS) {
    throw new Error("ACCESS_MANAGER_ADDRESS is required");
  }
  if (!PROTOCOL_ADDRESS) {
    throw new Error("PROTOCOL_ADDRESS is required");
  }
  if (!RANDOM_PRODUCER_ADDRESS) {
    throw new Error("RANDOM_PRODUCER_ADDRESS is required");
  }
  if (!FEE_RECIPIENT_ADDRESS) {
    throw new Error("FEE_RECIPIENT_ADDRESS is required");
  }
  if (!FEE_AMOUNT) {
    throw new Error("FEE_AMOUNT is required in basis points");
  }
  if (!PROTOCOL_MINIMAL_VESTING_PERIOD) {
    throw new Error("PROTOCOL_MINIMAL_VESTING_PERIOD is required");
  }

  const fees: LibFee.FeeStruct = {
    recipient: FEE_RECIPIENT_ADDRESS,
    amount_bp: BigInt(FEE_AMOUNT),
  };

  // Deploy the contract using upgrades.deployProxy
  const lotteryfactory =
    await ethers.getContractFactory("Lottery");
  const lottery = await upgrades.deployProxy(lotteryfactory, [
    ACCESS_MANAGER_ADDRESS,
    PROTOCOL_ADDRESS,
    RANDOM_PRODUCER_ADDRESS,
    fees,
    PROTOCOL_MINIMAL_VESTING_PERIOD,
  ]);
  const lotteryAddress = await lottery.getAddress();

  console.log(`Lottery deployed at: ${lotteryAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
