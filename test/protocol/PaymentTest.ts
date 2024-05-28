import { expect } from "chai";
import hre from "hardhat";
import { LibTransaction } from "../../typechain-types/contracts/DeelitProtocol";
import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { parseEther, ZeroAddress } from "ethers";
import {
  domain,
  OfferUtils,
  PaymentUtils,
  ZeroBytes32
} from "../utils/utils";
import { deployDeelitProtocolFixture, deployERC20MockFixture } from "../utils/fixtures";

describe("DeelitProtocol - Payment tests", function () {
  it("should be able to make native payment", async function () {
    const { deelit, feeCollector, alice, bob } = await loadFixture(
      deployDeelitProtocolFixture
    );

    const deelitAddress = await deelit.getAddress();
    const feeCollectorAddress = await feeCollector.getAddress();

    // alice offers 1 eth
    const offer = OfferUtils.builder()
      .withFromAddress(alice.address)
      .withChainId(hre.config.networks.hardhat.chainId)
      .withCurrencyCode("ETH")
      .withTokenAddress(ZeroAddress)
      .withPrice(hre.ethers.parseEther("1"))
      .get();
    const offerHash = OfferUtils.hash(offer, deelitAddress);

    // bob requests the payment
    const payment = PaymentUtils.builder()
      .withFromAddress(bob.address)
      .withOfferHash(offerHash)
      .withExpirationTime((await time.latest()) + time.duration.minutes(1))
      .get();
    const paymentHash = PaymentUtils.hash(payment, deelitAddress);

    // bob signs the payment
    const signature = await bob.signTypedData(
      domain(deelitAddress),
      PaymentUtils.typedData,
      payment
    );

    const tx: LibTransaction.TransactionStruct = {
      payment,
      offer,
    };

    await deelit
      .connect(alice)
      .pay(tx, signature, { value: parseEther("1.1") });

    const state = await deelit.payments(paymentHash);
    expect(state.acceptance).to.be.equal(ZeroBytes32);
    expect(state.conflict).to.be.equal(ZeroBytes32);
    expect(state.vesting).to.be.equal(
      BigInt(payment.vesting_period) + BigInt(await time.latest())
    );
    expect(await hre.ethers.provider.getBalance(deelitAddress)).to.be.equal(
      parseEther("1")
    );
    expect(
      await hre.ethers.provider.getBalance(feeCollectorAddress)
    ).to.be.equal(parseEther("0.1"));
  });

  it("should be able to make token payment", async function () {
    const { deelit, feeCollector, alice, bob, fees } = await loadFixture(
      deployDeelitProtocolFixture
    );
    const { erc20 } = await deployERC20MockFixture();

    const deelitAddress = await deelit.getAddress();
    const feeCollectorAddress = await feeCollector.getAddress();
    const erc20Address = await erc20.getAddress();

    // alice offers 100 tokens
    const offer = OfferUtils.builder()
      .withFromAddress(alice.address)
      .withChainId(hre.config.networks.hardhat.chainId)
      .withCurrencyCode("ERC20")
      .withTokenAddress(erc20Address)
      .withPrice(100n)
      .get();
    const offerHash = OfferUtils.hash(offer, deelitAddress);

    // bob requests the payment
    const payment = PaymentUtils.builder()
      .withFromAddress(bob.address)
      .withOfferHash(offerHash)
      .withExpirationTime((await time.latest()) + time.duration.minutes(1))
      .get();
    const paymentHash = PaymentUtils.hash(payment, deelitAddress);

    // bob signs the payment
    const signature = await bob.signTypedData(
      domain(deelitAddress),
      PaymentUtils.typedData,
      payment
    );

    const tx: LibTransaction.TransactionStruct = {
      payment,
      offer,
    };

    // Top up alice's account with the total amount with fees
    await erc20.transfer(alice.address, 110n);

    // alice approves the payment with the total amount
    await erc20.connect(alice).approve(deelitAddress, 110n);

    // alice pays
    await deelit.connect(alice).pay(tx, signature);

    const state = await deelit.payments(paymentHash);
    expect(state.acceptance).to.be.equal(ZeroBytes32);
    expect(state.conflict).to.be.equal(ZeroBytes32);
    expect(state.vesting).to.be.equal(
      BigInt(payment.vesting_period) + BigInt(await time.latest())
    );
    expect(await erc20.balanceOf(deelitAddress)).to.be.equal(100n);
    expect(await erc20.balanceOf(feeCollectorAddress)).to.be.equal(10n);
  });

  it("should be able to refund excess native payment", async function () {
    const { deelit, feeCollector, alice, bob } = await loadFixture(
      deployDeelitProtocolFixture
    );

    const deelitAddress = await deelit.getAddress();
    const feeCollectorAddress = await feeCollector.getAddress();

    // alice offers 1 eth
    const offer = OfferUtils.builder()
      .withFromAddress(alice.address)
      .withChainId(hre.config.networks.hardhat.chainId)
      .withCurrencyCode("ETH")
      .withTokenAddress(ZeroAddress)
      .withPrice(hre.ethers.parseEther("1"))
      .get();
    const offerHash = OfferUtils.hash(offer, deelitAddress);

    // bob requests the payment
    const payment = PaymentUtils.builder()
      .withFromAddress(bob.address)
      .withOfferHash(offerHash)
      .withExpirationTime((await time.latest()) + time.duration.minutes(1))
      .get();

    const paymentHash = PaymentUtils.hash(payment, deelitAddress);
    const signature = await bob.signTypedData(
      domain(deelitAddress),
      PaymentUtils.typedData,
      payment
    );

    const tx: LibTransaction.TransactionStruct = {
      payment,
      offer,
    };

    await deelit.connect(alice).pay(tx, signature, { value: parseEther("2") });

    const state = await deelit.payments(paymentHash);
    expect(state.acceptance).to.be.equal(ZeroBytes32);
    expect(state.conflict).to.be.equal(ZeroBytes32);
    expect(state.vesting).to.be.equal(
      BigInt(payment.vesting_period) + BigInt(await time.latest())
    );
    expect(await hre.ethers.provider.getBalance(deelitAddress)).to.be.equal(
      parseEther("1")
    );
    expect(
      await hre.ethers.provider.getBalance(feeCollectorAddress)
    ).to.be.equal(parseEther("0.1"));
  });

  it("should be able to make native payment with shipment", async function () {
    const { deelit, feeCollector, alice, bob } = await loadFixture(
      deployDeelitProtocolFixture
    );

    const deelitAddress = await deelit.getAddress();
    const feeCollectorAddress = await feeCollector.getAddress();

    // alice offers 1 eth
    const offer = OfferUtils.builder()
      .withFromAddress(alice.address)
      .withChainId(hre.config.networks.hardhat.chainId)
      .withCurrencyCode("ETH")
      .withTokenAddress(ZeroAddress)
      .withPrice(hre.ethers.parseEther("1"))
      .withShipmentPrice(hre.ethers.parseEther("0.1"))
      .get();
    const offerHash = OfferUtils.hash(offer, deelitAddress);

    // bob requests the payment
    const payment = PaymentUtils.builder()
      .withFromAddress(bob.address)
      .withOfferHash(offerHash)
      .withExpirationTime((await time.latest()) + time.duration.minutes(1))
      .get();
    const paymentHash = PaymentUtils.hash(payment, deelitAddress);

    // bob signs the payment
    const signature = await bob.signTypedData(
      domain(deelitAddress),
      PaymentUtils.typedData,
      payment
    );

    const tx: LibTransaction.TransactionStruct = {
      payment,
      offer,
    };

    await deelit
      .connect(alice)
      .pay(tx, signature, { value: parseEther("1.21") });

    const state = await deelit.payments(paymentHash);
    expect(state.acceptance).to.be.equal(ZeroBytes32);
    expect(state.conflict).to.be.equal(ZeroBytes32);
    expect(state.vesting).to.be.equal(
      BigInt(payment.vesting_period) + BigInt(await time.latest())
    );
    expect(await hre.ethers.provider.getBalance(deelitAddress)).to.be.equal(
      parseEther("1.1")
    );
    expect(
      await hre.ethers.provider.getBalance(feeCollectorAddress)
    ).to.be.equal(parseEther("0.11"));
  });

  it("should be able to make token payment with shipment", async function () {
    const { deelit, feeCollector, alice, bob } = await loadFixture(
      deployDeelitProtocolFixture
    );
    const { erc20 } = await deployERC20MockFixture();

    const deelitAddress = await deelit.getAddress();
    const feeCollectorAddress = await feeCollector.getAddress();
    const erc20Address = await erc20.getAddress();

    // alice offers 100 tokens
    const offer = OfferUtils.builder()
      .withFromAddress(alice.address)
      .withChainId(hre.config.networks.hardhat.chainId)
      .withCurrencyCode("ERC20")
      .withTokenAddress(erc20Address)
      .withPrice(100n)
      .withShipmentPrice(10n)
      .get();
    const offerHash = OfferUtils.hash(offer, deelitAddress);

    // bob requests the payment
    const payment = PaymentUtils.builder()
      .withFromAddress(bob.address)
      .withOfferHash(offerHash)
      .withExpirationTime((await time.latest()) + time.duration.minutes(1))
      .get();
    const paymentHash = PaymentUtils.hash(payment, deelitAddress);

    // bob signs the payment
    const signature = await bob.signTypedData(
      domain(deelitAddress),
      PaymentUtils.typedData,
      payment
    );

    const tx: LibTransaction.TransactionStruct = {
      payment,
      offer,
    };

    // Top up alice's account with the total amount with fees
    await erc20.transfer(alice.address, 121n);

    // alice approves the payment with the total amount
    await erc20.connect(alice).approve(deelitAddress, 121n);

    // alice pays
    await deelit.connect(alice).pay(tx, signature);

    const state = await deelit.payments(paymentHash);
    expect(state.acceptance).to.be.equal(ZeroBytes32);
    expect(state.conflict).to.be.equal(ZeroBytes32);
    expect(state.vesting).to.be.equal(
      BigInt(payment.vesting_period) + BigInt(await time.latest())
    );
    expect(await erc20.balanceOf(deelitAddress)).to.be.equal(110n);
    expect(await erc20.balanceOf(feeCollectorAddress)).to.be.equal(11n);
  });
});
