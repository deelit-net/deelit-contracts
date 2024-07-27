import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import {
  deployDeelitProtocolWithInitialPaymentFixture,
  deployDeelitProtocolWithInitialTokenPaymentFixture,
} from "../utils/fixtures";
import {
  AcceptanceUtils, ConflictUtils,
  domain,
  ZeroBytes32
} from "../utils/utils";
import { ZeroAddress } from "ethers";
import { LibTransaction } from "../../typechain-types/contracts/lottery/Lottery";

describe("DeelitProtocol - Claim tests", function () {
  describe("Claim with acceptance tests", function () {
    it("should be able to claim payment with signature", async function () {
      // alice send an offer to bob
      // bob signed a payment request
      // alice pays
      // charlie claims the payment for bob so alice signature is needed

      const { deelit, alice, bob, charlie, payment, paymentHash, offer } =
        await loadFixture(deployDeelitProtocolWithInitialPaymentFixture);

      const deelitAddress = await deelit.getAddress();
      const bobInitialBalance = await hre.ethers.provider.getBalance(
        bob.address,
      );

      const acceptance = AcceptanceUtils.builder()
        .withFromAddress(alice.address)
        .withPaymentHash(paymentHash)
        .get();

      const acceptanceHash = AcceptanceUtils.hash(acceptance, deelitAddress);

      const signature = await alice.signTypedData(
        domain(deelitAddress),
        AcceptanceUtils.typedData,
        acceptance,
      );

      const tx: LibTransaction.TransactionStruct = {
        payment,
        offer,
      };

      await deelit.connect(charlie).claimAccepted(tx, acceptance, signature);

      const state = await deelit.getPaymentState(paymentHash);
      expect(state.acceptance).to.equal(acceptanceHash);
      expect(state.conflict).to.equal(ZeroBytes32);
      expect(state.verdict).to.equal(ZeroBytes32);
      expect(await hre.ethers.provider.getBalance(bob.address)).to.equal(
        bobInitialBalance + hre.ethers.parseEther("1"),
      );
    });

    it("should not be able to claim payment without signature", async function () {
      // alice send an offer to bob
      // bob signed a payment request
      // alice pays
      // charlie claims the payment for bob so alice signature is needed

      const { deelit, paymentHash, alice, bob, charlie, payment, offer } =
        await loadFixture(deployDeelitProtocolWithInitialPaymentFixture);

      const tx: LibTransaction.TransactionStruct = {
        payment,
        offer,
      };

      const acceptance = AcceptanceUtils.builder()
        .withFromAddress(alice.address)
        .withPaymentHash(paymentHash)
        .get();

      await expect(
        deelit.connect(charlie).claimAccepted(tx, acceptance, ZeroBytes32),
      ).to.be.revertedWith("DeelitProtocol: Invalid signature");
    });

    it("should be able to claim payment without signature (called from payer)", async function () {
      // alice send an offer to bob
      // bob signed a payment request
      // alice pays
      // alice claims the payment for bob so no need for signature

      const { deelit, alice, bob, payment, paymentHash, offer } =
        await loadFixture(deployDeelitProtocolWithInitialPaymentFixture);

      const deelitAddress = await deelit.getAddress();
      const bobInitialBalance = await hre.ethers.provider.getBalance(
        bob.address,
      );

      const tx: LibTransaction.TransactionStruct = {
        payment,
        offer,
      };

      const acceptance = AcceptanceUtils.builder()
        .withFromAddress(alice.address)
        .withPaymentHash(paymentHash)
        .get();

      const acceptanceHash = AcceptanceUtils.hash(acceptance, deelitAddress);

      await deelit.connect(alice).claimAccepted(tx, acceptance, ZeroBytes32);

      const state = await deelit.getPaymentState(paymentHash);
      expect(state.acceptance).to.equal(acceptanceHash);
      expect(state.conflict).to.equal(ZeroBytes32);
      expect(state.verdict).to.equal(ZeroBytes32);
      expect(await hre.ethers.provider.getBalance(bob.address)).to.equal(
        bobInitialBalance + hre.ethers.parseEther("1"),
      );
    });

    it("should be able to claim token payment", async function () {
      // alice send an offer to bob
      // bob signed a payment request
      // alice pays in ERC20
      // bob claims the payment with acceptance for ERC20

      const { deelit, erc20, alice, bob, payment, paymentHash, offer } =
        await loadFixture(deployDeelitProtocolWithInitialTokenPaymentFixture);

      const deelitAddress = await deelit.getAddress();
      const bobInitialBalance = await erc20.balanceOf(bob.address);

      const acceptance = AcceptanceUtils.builder()
        .withFromAddress(alice.address)
        .withPaymentHash(paymentHash)
        .get();

      const acceptanceHash = AcceptanceUtils.hash(acceptance, deelitAddress);

      const signature = await alice.signTypedData(
        domain(deelitAddress),
        AcceptanceUtils.typedData,
        acceptance,
      );

      const tx: LibTransaction.TransactionStruct = {
        payment,
        offer,
      };

      await deelit.connect(bob).claimAccepted(tx, acceptance, signature);

      const state = await deelit.getPaymentState(paymentHash);
      expect(state.acceptance).to.equal(acceptanceHash);
      expect(state.conflict).to.equal(ZeroBytes32);
      expect(state.verdict).to.equal(ZeroBytes32);
      expect(await erc20.balanceOf(bob.address)).to.equal(
        bobInitialBalance + BigInt(offer.price),
      );
    });

    it("should not be able to claim payment if already claimed", async function () {
      // alice send an offer to bob
      // bob signed a payment request
      // alice pays
      // alice accepts the payment
      // bob claims the payment
      // bob tries to claim the payment again

      const { deelit, alice, bob, charlie, payment, paymentHash, offer } =
        await loadFixture(deployDeelitProtocolWithInitialPaymentFixture);
        
        const deelitAddress = await deelit.getAddress();

      const acceptance = AcceptanceUtils.builder()
        .withFromAddress(alice.address)
        .withPaymentHash(paymentHash)
        .get();


      const signature = await alice.signTypedData(
        domain(deelitAddress),
        AcceptanceUtils.typedData,
        acceptance,
      );

      const tx: LibTransaction.TransactionStruct = {
        payment,
        offer,
      };

      await deelit.connect(bob).claimAccepted(tx, acceptance, signature);

      await expect(deelit.connect(bob).claimAccepted(tx, acceptance, signature)).to.be.revertedWith(
        "DeelitProtocol: Payment already claimed",
      );
    });

    it("should not be able to claim payment if conflict", async function () {
      // alice send an offer to bob
      // bob signed a payment request
      // alice pays
      // alice creates a conflict
      // bob tries to claim the payment

      const { deelit, alice, bob, payment, paymentHash, offer } =
        await loadFixture(deployDeelitProtocolWithInitialPaymentFixture);

      const tx: LibTransaction.TransactionStruct = {
        payment,
        offer,
      };
      
      const conflict = ConflictUtils.builder()
        .withFromAddress(alice.address)
        .withPaymentHash(paymentHash)
        .get();

      const conflictHash = ConflictUtils.hash(conflict, await deelit.getAddress());

      await deelit.connect(alice).conflict(tx, conflict, ZeroAddress);

      const paymentState = await deelit.getPaymentState(paymentHash);
      expect(paymentState.acceptance).to.equal(ZeroBytes32);
      expect(paymentState.conflict).to.equal(conflictHash);
      expect(paymentState.verdict).to.equal(ZeroBytes32);

      await expect(deelit.connect(bob).claim(tx)).to.be.revertedWith(
        "DeelitProtocol: Payment in conflict");
    });
  });

  describe("Claim without acceptance tests", function () {
    it("should be able to claim payment after the vesting period", async function () {
      // alice send an offer to bob
      // bob signed a payment request
      // alice pays
      // charlie claims the payment for bob after vesting period

      const { deelit, bob, charlie, payment, paymentHash, offer } =
        await loadFixture(deployDeelitProtocolWithInitialPaymentFixture);

      const bobInitialBalance = await hre.ethers.provider.getBalance(
        bob.address,
      );

      const tx: LibTransaction.TransactionStruct = {
        payment,
        offer,
      };

      time.increaseTo(
        BigInt(payment.vesting_period) +
          BigInt((await time.latest()) + time.duration.seconds(10)),
      );

      await deelit.connect(charlie).claim(tx);

      const state = await deelit.getPaymentState(paymentHash);
      expect(state.acceptance).to.equal(await deelit.AUTO_ACCEPTANCE());
      expect(state.conflict).to.equal(ZeroBytes32);
      expect(state.verdict).to.equal(ZeroBytes32);
      expect(await hre.ethers.provider.getBalance(bob.address)).to.equal(
        bobInitialBalance + hre.ethers.parseEther("1"),
      );
    });

    it("should be able to claim token payment after the vesting period", async function () {
      const { deelit, erc20, bob, charlie, payment, paymentHash, offer } =
        await loadFixture(deployDeelitProtocolWithInitialTokenPaymentFixture);

      const bobInitialBalance = await erc20.balanceOf(bob.address);

      const tx: LibTransaction.TransactionStruct = {
        payment,
        offer,
      };

      time.increaseTo(
        BigInt(payment.vesting_period) + BigInt(await time.latest()),
      );

      await deelit.connect(charlie).claim(tx);

      const state = await deelit.getPaymentState(paymentHash);
      expect(state.acceptance).to.equal(await deelit.AUTO_ACCEPTANCE());
      expect(state.conflict).to.equal(ZeroBytes32);
      expect(state.verdict).to.equal(ZeroBytes32);
      expect(await erc20.balanceOf(bob.address)).to.equal(
        bobInitialBalance + BigInt(offer.price),
      );
    });

    it("should not be able to claim before the end of the vesting period", async function () {
      // alice send an offer to bob
      // bob signed a payment request
      // alice pays
      // bob claims the payment for bob but acceptance is needed

      const { deelit, bob, payment, offer } = await loadFixture(
        deployDeelitProtocolWithInitialPaymentFixture,
      );

      const tx: LibTransaction.TransactionStruct = {
        payment,
        offer,
      };

      await expect(deelit.connect(bob).claim(tx)).to.be.revertedWith(
        "DeelitProtocol: Payment deadline not reached. acceptance needed",
      );
    });

    it("should not be able to claim payment after the vesting period if already claimed", async function () {
      // alice send an offer to bob
      // bob signed a payment request
      // alice pays
      // bob claims the payment for bob after vesting period
      // bob tries to claim the payment again

      const { deelit, bob, charlie, payment, paymentHash, offer } =
        await loadFixture(deployDeelitProtocolWithInitialPaymentFixture);

      const tx: LibTransaction.TransactionStruct = {
        payment,
        offer,
      };

      time.increaseTo(
        BigInt(payment.vesting_period) + BigInt(await time.latest()),
      );

      await deelit.connect(charlie).claim(tx);
      expect(deelit.connect(charlie).claim(tx)).to.be.revertedWith(
        "DeelitProtocol: Payment already claimed",
      );
    });

    it("should not be able to claim payment after the vesting period if conflict", async function () {
      // alice send an offer to bob
      // bob signed a payment request
      // alice pays
      // alice creates a conflict
      // bob tries to claim the payment after vesting period

      const { deelit, alice, bob, payment, paymentHash, offer } =
        await loadFixture(deployDeelitProtocolWithInitialPaymentFixture);

      const tx: LibTransaction.TransactionStruct = {
        payment,
        offer,
      };

      const conflict = ConflictUtils.builder()
        .withFromAddress(alice.address)
        .withPaymentHash(paymentHash)
        .get();

      await deelit.connect(alice).conflict(tx, conflict, ZeroAddress);

      time.increaseTo(
        BigInt(payment.vesting_period) + BigInt(await time.latest()),
      );

      await expect(deelit.connect(bob).claim(tx)).to.be.revertedWith(
        "DeelitProtocol: Payment in conflict",
      );
    });
  });
});
