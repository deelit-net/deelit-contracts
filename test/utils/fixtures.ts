// We define a fixture to reuse the same setup in every test.
// We use loadFixture to run this setup once, snapshot that state,

import hre, { upgrades } from "hardhat";
import { BaseContract, parseEther, ZeroAddress } from "ethers";
import { calculateFee, domain, OfferUtils, PaymentUtils } from "./utils";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {
  DeelitAccessManager,
  DeelitProtocol,
  ERC20Mock,
  FeeRecipient,
  Lottery,
} from "../../typechain-types";
import { LibFee } from "../../typechain-types/contracts/fee/FeeCollector";
import { LibTransaction } from "../../typechain-types/contracts/lottery/Lottery";

const PAUSE_SELECTOR = "0x8456cb59";
const UNPAUSE_SELECTOR = "0x3f4ba83a";
const ADMIN_ROLE = 0n;
const PAUSER_ROLE = 1n;
const JUDGE_ROLE = 2n;
const RANDOM_CONSUMER_ROLE = 3n;
const PROTOCOL_MINIMAL_VESTING_PERIOD = 2592000n; // 30 days

export async function deployAccessManagerFixture() {
  const [owner] = await hre.ethers.getSigners();

  const factory = await hre.ethers.getContractFactory("DeelitAccessManager");
  const accessManager = (await upgrades.deployProxy(factory, [
    owner.address,
  ])) as BaseContract as DeelitAccessManager;
  const accessManagerAddress = await accessManager.getAddress();

  return {
    accessManager,
    accessManagerAddress,
    owner,
    ADMIN_ROLE,
    PAUSER_ROLE,
    JUDGE_ROLE,
  };
}

export async function deployFeeRecipientFixture() {
  const accessManagerDeployment = await deployAccessManagerFixture();

  const factory = await hre.ethers.getContractFactory("FeeRecipient");
  const feeRecipient = (await upgrades.deployProxy(factory, [
    accessManagerDeployment.accessManagerAddress,
  ])) as BaseContract as FeeRecipient;
  const feeRecipientAddress = await feeRecipient.getAddress();

  return { ...accessManagerDeployment, feeRecipient, feeRecipientAddress };
}

export async function deployERC20MockFixture() {
  const [owner] = await hre.ethers.getSigners();

  const erc20 = (await hre.ethers.deployContract(
    "ERC20Mock",
  )) as BaseContract as ERC20Mock;
  const erc20Address = await erc20.getAddress();

  return { erc20, erc20Address, owner };
}

export async function deployDeelitProtocolFixture() {
  // Contracts are deployed using the first signer/account by default
  const [owner, alice, bob, charlie] = await hre.ethers.getSigners();

  // Deploy FeeRecipient mock
  const feeRecipientDeployment = await deployFeeRecipientFixture();

  const protocolFees: LibFee.FeeStruct = {
    recipient: feeRecipientDeployment.feeRecipientAddress,
    amount_bp: 1000n, // 10%
  };

  // Deploy the contract using upgrades.deployProxy
  const factory = await hre.ethers.getContractFactory("DeelitProtocol");
  const deelit = (await upgrades.deployProxy(factory, [
    feeRecipientDeployment.accessManagerAddress,
    protocolFees,
  ])) as BaseContract as DeelitProtocol;

  const deelitAddress = await deelit.getAddress();

  // set restrictions
  await feeRecipientDeployment.accessManager.setTargetFunctionRole(
    deelitAddress,
    [PAUSE_SELECTOR, UNPAUSE_SELECTOR],
    feeRecipientDeployment.PAUSER_ROLE,
  );

  return {
    ...feeRecipientDeployment,
    deelit,
    deelitAddress,
    protocolFees,
    owner,
    alice,
    bob,
    charlie,
  };
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
    payment,
  );

  const tx: LibTransaction.TransactionStruct = {
    payment,
    offer,
  };

  await deployment.deelit
    .connect(deployment.alice)
    .pay(tx, signature, ZeroAddress, { value: parseEther("1.1") });

  return { ...deployment, payment, paymentHash, offer, offerHash, signature };
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
    payment,
  );

  const tx: LibTransaction.TransactionStruct = {
    payment,
    offer,
  };

  const amountWithFees =
    BigInt(offer.price) +
    calculateFee(
      BigInt(offer.price),
      BigInt(deployment.protocolFees.amount_bp),
    );
  erc20.transfer(deployment.alice.address, amountWithFees);
  erc20.approve(deployment.deelitAddress, amountWithFees);

  await erc20
    .connect(deployment.alice)
    .approve(deployment.deelitAddress, amountWithFees);

  await deployment.deelit
    .connect(deployment.alice)
    .pay(tx, signature, ZeroAddress);

  return {
    ...deployment,
    erc20,
    payment,
    paymentHash,
    offer,
    offerHash,
    signature,
  };
}

export async function deployDeelitTokenFixture() {
  const accessManagerDeployment = await deployAccessManagerFixture();

  const deelitTokenFactory = await hre.ethers.getContractFactory("DeeToken");
  const deelitToken = (await upgrades.deployProxy(deelitTokenFactory, [
    accessManagerDeployment.accessManagerAddress,
  ])) as BaseContract as Lottery;
  const deelitTokenAddress = await deelitToken.getAddress();

  return { deelitToken, deelitTokenAddress, ...accessManagerDeployment };
}

export async function deployRandomProducerMockFixture() {
  const [owner] = await hre.ethers.getSigners();

  const randomProducerMock = await hre.ethers.deployContract(
    "RandomProducerMock",
    [0],
  );
  const randomProducerMockAddress = await randomProducerMock.getAddress();

  return {
    randomProducerMock,
    randomProducerMockAddress,
    owner,
  };
}

export async function deployLotteryFixture() {
  const [owner, participant1, participant2, participant3, participant4] =
    await hre.ethers.getSigners();

  const deelitProtocolFixture = await deployDeelitProtocolFixture();
  const randomProducerMockFixture = await deployRandomProducerMockFixture();

  const lotteryFees: LibFee.FeeStruct = {
    recipient: deelitProtocolFixture.feeRecipientAddress,
    amount_bp: 2000n, // 20%
  };

  const LotteryFactory = await hre.ethers.getContractFactory("Lottery");
  const lottery = (await upgrades.deployProxy(LotteryFactory, [
    deelitProtocolFixture.accessManagerAddress,
    deelitProtocolFixture.deelitAddress,
    randomProducerMockFixture.randomProducerMockAddress,
    lotteryFees,
    PROTOCOL_MINIMAL_VESTING_PERIOD,
  ])) as BaseContract as Lottery;

  const lotteryAddress = await lottery.getAddress();

  return {
    ...deelitProtocolFixture,
    ...randomProducerMockFixture,
    lottery,
    lotteryAddress,
    owner,
    participant1,
    participant2,
    participant3,
    participant4,
    lotteryFees,
    protocolMinVestingPeriod: PROTOCOL_MINIMAL_VESTING_PERIOD,
  };
}
