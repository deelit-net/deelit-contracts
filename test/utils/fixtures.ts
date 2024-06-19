// We define a fixture to reuse the same setup in every test.
// We use loadFixture to run this setup once, snapshot that state,

import hre, { upgrades } from "hardhat";
import { BaseContract, parseEther, ZeroAddress } from "ethers";
import { calculateFee, domain, OfferUtils, PaymentUtils } from "./utils";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { DeelitAccessManager, DeelitProtocol, FeeCollector } from "../../typechain-types";
import { LibFee, LibTransaction } from "../../typechain-types/contracts/DeelitProtocol";

const PAUSE_SELECTOR = "0x8456cb59";
const UNPAUSE_SELECTOR = "0x3f4ba83a";

export async function deployAccessManagerFixture () {
  const [owner] = await hre.ethers.getSigners();

  const ADMIN_ROLE = 0n;
  const PAUSER_ROLE = 1n;
  const JUDGE_ROLE = 2n;

  const factory = await hre.ethers.getContractFactory("DeelitAccessManager");
  const accessManager = (await upgrades.deployProxy(factory, [owner.address] )) as BaseContract as DeelitAccessManager;
  const accessManagerAddress = await accessManager.getAddress();

  return { accessManager, accessManagerAddress, owner, ADMIN_ROLE, PAUSER_ROLE, JUDGE_ROLE};
}

export async function deployFeeCollectorFixture () {
  const accessManagerDeployment = await deployAccessManagerFixture();

  const factory = await hre.ethers.getContractFactory("FeeCollector");
  const feeCollector = (await upgrades.deployProxy(factory, [ accessManagerDeployment.accessManagerAddress ])) as BaseContract as FeeCollector;
  const feeCollectorAddress = await feeCollector.getAddress();

  return { ...accessManagerDeployment, feeCollector, feeCollectorAddress };
}

export async function deployERC20MockFixture() {
  const [owner] = await hre.ethers.getSigners();

  const erc20 = await hre.ethers.deployContract("ERC20Mock");
  const erc20Address = await erc20.getAddress();

  return { erc20, erc20Address, owner };
}

export async function deployDeelitProtocolFixture() {
  // Contracts are deployed using the first signer/account by default
  const [owner, alice, bob, charlie] = await hre.ethers.getSigners();

  // Deploy FeeCollector mock
  const feeCollectorDeployment = await deployFeeCollectorFixture();

  const fees: LibFee.FeeStruct = {
    collector: feeCollectorDeployment.feeCollectorAddress,
    amount_bp: 1000n, // 10%
  };

  // Deploy the contract using upgrades.deployProxy
  const factory = await hre.ethers.getContractFactory("DeelitProtocol");
  const deelit = (await upgrades.deployProxy(factory, [
    feeCollectorDeployment.accessManagerAddress,
    fees
  ])) as BaseContract as DeelitProtocol;

  const deelitAddress = await deelit.getAddress();

  // set restrictions
  await feeCollectorDeployment.accessManager.setTargetFunctionRole(deelitAddress, [PAUSE_SELECTOR, UNPAUSE_SELECTOR], feeCollectorDeployment.PAUSER_ROLE);

  return { ...feeCollectorDeployment, deelit, deelitAddress, fees, owner, alice, bob, charlie };
}

export async function deployDeelitProtocolWithInitialPaymentFixture() {
    const deployment = await deployDeelitProtocolFixture();

    const deelitAddress = await deployment.deelit.getAddress();

    // alice offers 1 eth
    const offer = OfferUtils.builder()
      .withFromAddress(deployment.alice.address)
      .withChainId(hre.config.networks.hardhat.chainId)
      .withCurrencyCode("ETH")
      .withTokenAddress(ZeroAddress)
      .withPrice(hre.ethers.parseEther("1"))
      .get();
    const offerHash = OfferUtils.hash(offer, deelitAddress);

    // bob requests the payment
    const payment = PaymentUtils.builder()
      .withFromAddress(deployment.bob.address)
      .withDestinationAddress(deployment.bob.address)
      .withOfferHash(offerHash)
      .withExpirationTime((await time.latest()) + time.duration.minutes(1))
      .withVestingPeriod(time.duration.days(1))
      .get();
    const paymentHash = PaymentUtils.hash(payment, deelitAddress);

    // bob signs the payment
    const signature = await deployment.bob.signTypedData(
      domain(deelitAddress),
      PaymentUtils.typedData,
      payment
    );

    const tx: LibTransaction.TransactionStruct = {
      payment,
      offer,
    };

    await deployment.deelit
      .connect(deployment.alice)
      .pay(tx, signature, { value: parseEther("1.1") });


    return {...deployment, payment, paymentHash, offer, offerHash, signature};
}

export async function deployDeelitProtocolWithInitialTokenPaymentFixture() {
    const deployment = await deployDeelitProtocolFixture();
    const { erc20 } = await deployERC20MockFixture();

    // alice offers 1 eth
    const offer = OfferUtils.builder()
      .withFromAddress(deployment.alice.address)
      .withChainId(hre.config.networks.hardhat.chainId)
      .withCurrencyCode("ERC20")
      .withTokenAddress(await erc20.getAddress())
      .withPrice(hre.ethers.parseEther("1"))
      .get();
    const offerHash = OfferUtils.hash(offer, deployment.deelitAddress);

    // bob requests the payment
    const payment = PaymentUtils.builder()
      .withFromAddress(deployment.bob.address)
      .withDestinationAddress(deployment.bob.address)
      .withOfferHash(offerHash)
      .withExpirationTime((await time.latest()) + time.duration.minutes(1))
      .withVestingPeriod(time.duration.days(1))
      .get();
    const paymentHash = PaymentUtils.hash(payment, deployment.deelitAddress);

    // bob signs the payment
    const signature = await deployment.bob.signTypedData(
      domain(deployment.deelitAddress),
      PaymentUtils.typedData,
      payment
    );

    const tx: LibTransaction.TransactionStruct = {
      payment,
      offer,
    };

    const amountWithFees = BigInt(offer.price) + calculateFee(BigInt(offer.price), BigInt(deployment.fees.amount_bp));
    erc20.transfer(deployment.alice.address, amountWithFees);
    erc20.approve(deployment.deelitAddress, amountWithFees);

    await erc20.connect(deployment.alice).approve(deployment.deelitAddress, amountWithFees)

    await deployment.deelit
      .connect(deployment.alice)
      .pay(tx, signature);


    return {...deployment, erc20, payment, paymentHash, offer, offerHash, signature};
}


export async function deployDeelitTokenFixture() {
  const [owner] = await hre.ethers.getSigners();

  const deelitToken = await hre.ethers.deployContract("DeeToken");
  const deelitTokenAddress = await deelitToken.getAddress();

  return { deelitToken, deelitTokenAddress, owner };
}
