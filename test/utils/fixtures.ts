// We define a fixture to reuse the same setup in every test.
// We use loadFixture to run this setup once, snapshot that state,

import hre, { upgrades } from "hardhat";
import {
  DeelitProtocol,
  LibFee,
  LibTransaction,
} from "../../typechain-types/contracts/DeelitProtocol";
import { BaseContract, parseEther, ZeroAddress } from "ethers";
import { calculateFee, domain, OfferUtils, PaymentUtils } from "./utils";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { FeeCollector } from "../../typechain-types";

export async function deployFeeCollectorFixture () {
  const [owner] = await hre.ethers.getSigners();

  const factory = await hre.ethers.getContractFactory("FeeCollector");
  const feeCollector = (await upgrades.deployProxy(factory)) as BaseContract as FeeCollector;
  const feeCollectorAddress = await feeCollector.getAddress();

  return { feeCollector, feeCollectorAddress, owner };
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
  const { feeCollector } = await deployFeeCollectorFixture();

  const fees: LibFee.FeeStruct = {
    collector: await feeCollector.getAddress(),
    amount_bp: 1000n, // 10%
  };

  // Deploy the contract using upgrades.deployProxy
  const factory = await hre.ethers.getContractFactory("DeelitProtocol");
  const deelit = (await upgrades.deployProxy(factory, [
    fees,
  ])) as BaseContract as DeelitProtocol;

  return { factory, deelit, fees, feeCollector, owner, alice, bob, charlie };
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

    const deelitAddress = await deployment.deelit.getAddress();

    // alice offers 1 eth
    const offer = OfferUtils.builder()
      .withFromAddress(deployment.alice.address)
      .withChainId(hre.config.networks.hardhat.chainId)
      .withCurrencyCode("ERC20")
      .withTokenAddress(await erc20.getAddress())
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

    const amountWithFees = BigInt(offer.price) + calculateFee(BigInt(offer.price), BigInt(deployment.fees.amount_bp));
    erc20.transfer(deployment.alice.address, amountWithFees);
    erc20.approve(deelitAddress, amountWithFees);

    await erc20.connect(deployment.alice).approve(deelitAddress, amountWithFees)

    await deployment.deelit
      .connect(deployment.alice)
      .pay(tx, signature);


    return {...deployment, erc20, payment, paymentHash, offer, offerHash, signature};
}
