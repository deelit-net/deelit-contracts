import { ethers, upgrades } from "hardhat";
import { LibFee } from "../typechain-types/contracts/DeelitProtocol";


async function main() {

    const feeCollectorFactory = await ethers.getContractFactory("FeeCollector");
    const feeCollector = (await upgrades.deployProxy(feeCollectorFactory));
    const feeCollectorAddress = await feeCollector.getAddress();
 
    
    const fees: LibFee.FeeStruct = {
        collector: await feeCollector.getAddress(),
        amount_bp: 1n, // 1%
    };

    // Deploy the contract using upgrades.deployProxy
    const deelitProtocolfactory = await ethers.getContractFactory("DeelitProtocol");
    const deelitProtocol = (await upgrades.deployProxy(deelitProtocolfactory, [
        fees,
    ]));
    const deelitProtocolAddress = await deelitProtocol.getAddress();

    console.log(`FeeCollector deployed at: ${feeCollectorAddress}`);
    console.log(`DeelitProtocol deployed at: ${deelitProtocolAddress}`);

  }
  
  main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });