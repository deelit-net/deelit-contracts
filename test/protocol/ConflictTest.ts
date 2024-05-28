import {
    loadFixture
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import {
    deployDeelitProtocolWithInitialPaymentFixture,
    deployDeelitProtocolWithInitialTokenPaymentFixture
} from "../utils/fixtures";
import {
    AcceptanceUtils,
    ConflictUtils,
    domain,
    VerdictUtils,
    ZeroBytes32
} from "../utils/utils";
import hre from "hardhat";
import { LibTransaction } from "../../typechain-types/contracts/DeelitProtocol";

describe("DeelitProtocol - Conflict tests", function () {
  describe("Conflict creation", function () {

    it("should be able to declare a conflict from payer", async function () {
        // alice send an offer to bob
        // bob signed a payment request
        // alice pays
        // alice signed a conflict
        // charlie declares the conflict

        const { deelit, alice, charlie, payment, paymentHash, offer } =
            await loadFixture(deployDeelitProtocolWithInitialPaymentFixture);
        
        const deelitAddress = await deelit.getAddress();

        const tx: LibTransaction.TransactionStruct = {
            payment,
            offer,
        };

        const conflict = ConflictUtils
            .builder()
            .withFromAddress(alice.address)
            .withPaymentHash(paymentHash)
            .get();

        const signature = await alice.signTypedData(
            domain(deelitAddress),
            ConflictUtils.typedData,
            conflict
        );

        await deelit.connect(charlie).conflict(tx, conflict, signature);

        const state = await deelit.payments(paymentHash);

        expect(state.acceptance).to.equal(ZeroBytes32);
        expect(state.conflict).to.equal(ConflictUtils.hash(conflict, deelitAddress));
        expect(state.verdict).to.equal(ZeroBytes32);
    });

    it("should be able to declare a conflict from payee", async function () {
        // alice send an offer to bob
        // bob signed a payment request
        // alice pays
        // bob signed a conflict
        // charlie declares the conflict

        const { deelit, bob, charlie, payment, paymentHash, offer } =
            await loadFixture(deployDeelitProtocolWithInitialPaymentFixture);

        const deelitAddress = await deelit.getAddress();

        const tx: LibTransaction.TransactionStruct = {
            payment,
            offer,
        };

        const conflict = ConflictUtils
            .builder()
            .withFromAddress(bob.address)
            .withPaymentHash(paymentHash)
            .get();

        const signature = await bob.signTypedData(
            domain(deelitAddress),
            ConflictUtils.typedData,
            conflict
        );

        await deelit.connect(charlie).conflict(tx, conflict, signature);

        const state = await deelit.payments(paymentHash);
        expect(state.acceptance).to.equal(ZeroBytes32);
        expect(state.conflict).to.equal(ConflictUtils.hash(conflict, deelitAddress));
        expect(state.verdict).to.equal(ZeroBytes32);
    });

    it("should be able to declare a conflict without signature", async function () {
        // alice send an offer to bob
        // bob signed a payment request
        // alice pays
        // alice declares the conflict without signature (not needed)

        const { deelit, alice, payment, paymentHash, offer } =
            await loadFixture(deployDeelitProtocolWithInitialPaymentFixture);
        
        const deelitAddress = await deelit.getAddress();
    
        const tx: LibTransaction.TransactionStruct = {
            payment,
            offer,
        };

        const conflict = ConflictUtils
            .builder()
            .withFromAddress(alice.address)
            .withPaymentHash(paymentHash)
            .get();
        
        await deelit.connect(alice).conflict(tx, conflict, ZeroBytes32);

        const state = await deelit.payments(paymentHash);
        expect(state.acceptance).to.equal(ZeroBytes32);
        expect(state.conflict).to.equal(ConflictUtils.hash(conflict, deelitAddress));
        expect(state.verdict).to.equal(ZeroBytes32);
    });
    
    it("should not be able to declare a conflict on non initiated payment", async function () {
        // alice send an offer to bob
        // bob signed a payment request
        // alice pays
        // alice declares the conflict
        // alice tries to declare the conflict again

        const { deelit, alice, payment, paymentHash, offer } =
            await loadFixture(deployDeelitProtocolWithInitialPaymentFixture);
        
        const tx: LibTransaction.TransactionStruct = {
            payment,
            offer,
        };

        const conflict = ConflictUtils
            .builder()
            .withFromAddress(alice.address)
            .withPaymentHash(paymentHash)
            .get();

        await deelit.connect(alice).conflict(tx, conflict, ZeroBytes32);

        await expect(deelit.connect(alice).conflict(tx, conflict, ZeroBytes32))
            .to.be.revertedWith("DeelitProtocol: Payment already in conflict");
    });

    it("should not be able to declare a conflict if payment claimed", async function () {
        // alice send an offer to bob
        // bob signed a payment request
        // alice pays
        // alice sign acceptance
        // bob claims the payment
        // alice declares the conflict

        const { deelit, alice, bob, payment, paymentHash, offer } =
            await loadFixture(deployDeelitProtocolWithInitialPaymentFixture);
        
        const tx: LibTransaction.TransactionStruct = {
            payment,
            offer,
        };

        const acceptance = AcceptanceUtils.builder().withFromAddress(alice.address).withPaymentHash(paymentHash).get();
        const acceptanceSignature = await alice.signTypedData(domain(await deelit.getAddress()), AcceptanceUtils.typedData, acceptance);

        await deelit.connect(bob).claimAccepted(tx, acceptance, acceptanceSignature);
        
        const conflict = ConflictUtils.builder().withFromAddress(alice.address).withPaymentHash(paymentHash).get();
        await expect(deelit.connect(alice).conflict(tx, conflict, ZeroBytes32))
            .to.be.revertedWith("DeelitProtocol: Payment already claimed");
    
    });

    it("should not be able to declare a conflict if conflict already exist", async function () {
        // alice send an offer to bob
        // bob signed a payment request
        // alice pays
        // alice declares the conflict
        // bob declares the conflict

        const { deelit, alice, bob, payment, paymentHash, offer } =
            await loadFixture(deployDeelitProtocolWithInitialPaymentFixture);

        const tx: LibTransaction.TransactionStruct = {
            payment,
            offer,
        };

        const aliceConflict = ConflictUtils.builder().withFromAddress(alice.address).withPaymentHash(paymentHash).get();
        await deelit.connect(alice).conflict(tx, aliceConflict, ZeroBytes32);

        const bobConflict = ConflictUtils.builder().withFromAddress(bob.address).withPaymentHash(paymentHash).get();
        await expect(deelit.connect(bob).conflict(tx, bobConflict, ZeroBytes32))
            .to.be.revertedWith("DeelitProtocol: Payment already in conflict");
    });

  });

  describe("Conflict resolution", function () {

    it("should be able to resolve with verdict signature", async function () {
        // alice send an offer to bob
        // bob signed a payment request
        // alice pays
        // alice sign the conflict
        // charlie resolves the conflict without signature
        
        const { deelit, alice, charlie, payment, paymentHash, offer } =
            await loadFixture(deployDeelitProtocolWithInitialPaymentFixture);
    
        // grant charlie as judge
        await deelit.grantRole(await deelit.JUDGE_ROLE(), charlie.address);

        const deelitAddress = await deelit.getAddress();

        const tx: LibTransaction.TransactionStruct = {
            payment,
            offer,
        };

        const conflict = ConflictUtils.builder().withFromAddress(alice.address).withPaymentHash(paymentHash).get();
        const conflictSignature = await alice.signTypedData(domain(deelitAddress), ConflictUtils.typedData, conflict);
        await deelit.connect(charlie).conflict(tx, conflict, conflictSignature);;

        const verdict = VerdictUtils
            .builder()
            .withFromAddress(charlie.address)
            .withPaymentHash(paymentHash)
            .withPayeeBp(10000)
            .withPayerBp(0)
            .get();
        const verdictHash = await  VerdictUtils.hash(verdict, deelitAddress);

        await deelit.connect(charlie).resolve(tx, verdict, ZeroBytes32);

        const state = await deelit.payments(paymentHash);
        expect(state.verdict).to.equals(verdictHash);
    });

    it("should be able to resolve with verdict signature", async function () {
        // alice send an offer to bob
        // bob signed a payment request
        // alice pays
        // alice sign the conflict
        // charlie resolves the conflict with verdict signature
        // alice call resolution with charlie signature
        
        const { deelit, alice, charlie, payment, paymentHash, offer } =
            await loadFixture(deployDeelitProtocolWithInitialPaymentFixture);
    
        // grant charlie as judge
        await deelit.grantRole(await deelit.JUDGE_ROLE(), charlie.address);

        const deelitAddress = await deelit.getAddress();

        const tx: LibTransaction.TransactionStruct = {
            payment,
            offer,
        };

        const conflict = ConflictUtils.builder().withFromAddress(alice.address).withPaymentHash(paymentHash).get();
        const conflictSignature = await alice.signTypedData(domain(deelitAddress), ConflictUtils.typedData, conflict);
        await deelit.connect(charlie).conflict(tx, conflict, conflictSignature);;

        const verdict = VerdictUtils
            .builder()
            .withFromAddress(charlie.address)
            .withPaymentHash(paymentHash)
            .withPayeeBp(10000)
            .withPayerBp(0)
            .get();
        const verdictHash = await  VerdictUtils.hash(verdict, deelitAddress);
        const signature = await charlie.signTypedData(domain(deelitAddress), VerdictUtils.typedData, verdict);

        await deelit.connect(alice).resolve(tx, verdict, signature);

        const state = await deelit.payments(paymentHash);
        expect(state.verdict).to.equals(verdictHash);
    });
    
    it("should be able to resolve a conflict with full refund", async function () {
        // alice send an offer to bob
        // bob signed a payment request
        // alice pays
        // alice sign the conflict
        // charlie resolves the conflict with full refund
        
        const { deelit, alice, charlie, payment, paymentHash, offer } =
            await loadFixture(deployDeelitProtocolWithInitialPaymentFixture);
    
        // grant charlie as judge
        await deelit.grantRole(await deelit.JUDGE_ROLE(), charlie.address);

        const deelitAddress = await deelit.getAddress();
        const aliceBalanceBefore = await hre.ethers.provider.getBalance(alice.address);

        const tx: LibTransaction.TransactionStruct = {
            payment,
            offer,
        };

        const conflict = ConflictUtils.builder().withFromAddress(alice.address).withPaymentHash(paymentHash).get();
        const conflictSignature = await alice.signTypedData(domain(deelitAddress), ConflictUtils.typedData, conflict);
        await deelit.connect(charlie).conflict(tx, conflict, conflictSignature);;

        const verdict = VerdictUtils
            .builder()
            .withFromAddress(charlie.address)
            .withPaymentHash(paymentHash)
            .withPayeeBp(10000)
            .withPayerBp(0)
            .get();
        const verdictHash = await  VerdictUtils.hash(verdict, deelitAddress);
        const signature = await charlie.signTypedData(domain(deelitAddress), VerdictUtils.typedData, verdict);

        await deelit.connect(charlie).resolve(tx, verdict, ZeroBytes32);

        const state = await deelit.payments(paymentHash);
        expect(state.verdict).to.equals(verdictHash);
        expect(await hre.ethers.provider.getBalance(alice.address)).to.equals(aliceBalanceBefore + BigInt(offer.price));
    });

    it("should be able to resolve a conflict with partial refund", async function () {
        // alice send an offer to bob
        // bob signed a payment request
        // alice pays
        // alice sign the conflict
        // charlie resolves the conflict with partial refund

        const { deelit, alice, bob, charlie, payment, paymentHash, offer } =
            await loadFixture(deployDeelitProtocolWithInitialPaymentFixture);

        // grant charlie as judge
        await deelit.grantRole(await deelit.JUDGE_ROLE(), charlie.address);

        const deelitAddress = await deelit.getAddress();
        const aliceBalanceBefore = await hre.ethers.provider.getBalance(alice.address);
        const bobBalanceBefore = await hre.ethers.provider.getBalance(bob.address);

        const tx: LibTransaction.TransactionStruct = {
            payment,
            offer,
        };

        const conflict = ConflictUtils.builder().withFromAddress(alice.address).withPaymentHash(paymentHash).get();
        const conflictSignature = await alice.signTypedData(domain(deelitAddress), ConflictUtils.typedData, conflict);
        await deelit.connect(charlie).conflict(tx, conflict, conflictSignature);

        const verdict = VerdictUtils
            .builder()
            .withFromAddress(charlie.address)
            .withPaymentHash(paymentHash)
            .withPayeeBp(5000)
            .withPayerBp(5000)
            .get();

        const verdictHash = await VerdictUtils.hash(verdict, deelitAddress);
        const signature = await charlie.signTypedData(domain(deelitAddress), VerdictUtils.typedData, verdict);

        await deelit.connect(charlie).resolve(tx, verdict, ZeroBytes32);
        
        const state = await deelit.payments(paymentHash);
        expect(state.verdict).to.equals(verdictHash);
        expect(await hre.ethers.provider.getBalance(alice.address)).to.equals(aliceBalanceBefore + BigInt(offer.price) / 2n);
        expect(await hre.ethers.provider.getBalance(bob.address)).to.equals(bobBalanceBefore + BigInt(offer.price) / 2n);

    });

    it("should be able to resolve a conflict with full payment", async function () {
        // alice send an offer to bob
        // bob signed a payment request
        // alice pays
        // bob sign the conflict
        // charlie resolves the conflict with full payment

        const { deelit, alice, bob, charlie, payment, paymentHash, offer } =
            await loadFixture(deployDeelitProtocolWithInitialPaymentFixture);

        // grant charlie as judge
        await deelit.grantRole(await deelit.JUDGE_ROLE(), charlie.address);

        const deelitAddress = await deelit.getAddress();
        const aliceBalanceBefore = await hre.ethers.provider.getBalance(alice.address);
        const bobBalanceBefore = await hre.ethers.provider.getBalance(bob.address);

        const tx: LibTransaction.TransactionStruct = {
            payment,
            offer,
        };

        const conflict = ConflictUtils.builder().withFromAddress(bob.address).withPaymentHash(paymentHash).get();
        const conflictSignature = await bob.signTypedData(domain(deelitAddress), ConflictUtils.typedData, conflict);
        await deelit.connect(charlie).conflict(tx, conflict, conflictSignature);


        const verdict = VerdictUtils
            .builder()
            .withFromAddress(charlie.address)
            .withPaymentHash(paymentHash)
            .withPayeeBp(0)
            .withPayerBp(10000)
            .get();

        const verdictHash = await VerdictUtils.hash(verdict, deelitAddress);
        const signature = await charlie.signTypedData(domain(deelitAddress), VerdictUtils.typedData, verdict);

        await deelit.connect(charlie).resolve(tx, verdict, ZeroBytes32);

        const state = await deelit.payments(paymentHash);
        expect(state.verdict).to.equals(verdictHash);
        expect(await hre.ethers.provider.getBalance(alice.address)).to.equals(aliceBalanceBefore);
        expect(await hre.ethers.provider.getBalance(bob.address)).to.equals(bobBalanceBefore + BigInt(offer.price));
    });

    it("should be able to resolve a conflict with token", async function () {
        const { deelit, erc20, alice, bob, charlie, payment, paymentHash, offer } =
            await loadFixture(deployDeelitProtocolWithInitialTokenPaymentFixture);

        // grant charlie as judge
        await deelit.grantRole(await deelit.JUDGE_ROLE(), charlie.address);

        const deelitAddress = await deelit.getAddress();
        const aliceBalanceBefore = await erc20.balanceOf(alice.address);
        const bobBalanceBefore = await erc20.balanceOf(bob.address);

        const tx: LibTransaction.TransactionStruct = {
            payment,
            offer,
        };

        const conflict = ConflictUtils.builder().withFromAddress(bob.address).withPaymentHash(paymentHash).get();
        const conflictSignature = await bob.signTypedData(domain(deelitAddress), ConflictUtils.typedData, conflict);
        await deelit.connect(charlie).conflict(tx, conflict, conflictSignature);

        const verdict = VerdictUtils
            .builder()
            .withFromAddress(charlie.address)
            .withPaymentHash(paymentHash)
            .withPayeeBp(6000)
            .withPayerBp(4000)
            .get();

        const verdictHash = await VerdictUtils.hash(verdict, deelitAddress);
        const signature = await charlie.signTypedData(domain(deelitAddress), VerdictUtils.typedData, verdict);

        await deelit.connect(charlie).resolve(tx, verdict, ZeroBytes32);

        const paymentState = await deelit.payments(paymentHash);
        expect(paymentState.verdict).to.equals(verdictHash);

        const aliceBalanceAfter = await erc20.balanceOf(alice.address);
        const bobBalanceAfter = await erc20.balanceOf(bob.address);

        expect(aliceBalanceAfter).to.equals(aliceBalanceBefore + (BigInt(offer.price) / 10n * 6n));
        expect(bobBalanceAfter).to.equals(bobBalanceBefore + (BigInt(offer.price) / 10n * 4n));
    });  

    it("should not be able to resolve a conflict with rest", async function () {
        // alice send an offer to bob
        // bob signed a payment request
        // alice pays
        // alice sign the conflict
        // charlie resolves the conflict with rest

        const { deelit, alice, charlie, payment, paymentHash, offer } =
            await loadFixture(deployDeelitProtocolWithInitialPaymentFixture);
        
        // grant charlie as judge
        await deelit.grantRole(await deelit.JUDGE_ROLE(), charlie.address);

        const deelitAddress = await deelit.getAddress();

        const tx: LibTransaction.TransactionStruct = {
            payment,
            offer,
        };

        const conflict = ConflictUtils.builder().withFromAddress(alice.address).withPaymentHash(paymentHash).get();
        const conflictSignature = await alice.signTypedData(domain(deelitAddress), ConflictUtils.typedData, conflict);
        await deelit.connect(charlie).conflict(tx, conflict, conflictSignature);

        const verdict = VerdictUtils
            .builder()
            .withFromAddress(charlie.address)
            .withPaymentHash(paymentHash)
            .withPayeeBp(5000)
            .withPayerBp(4000)
            .get();

        const signature = await charlie.signTypedData(domain(deelitAddress), VerdictUtils.typedData, verdict);

        await expect(deelit.connect(charlie).resolve(tx, verdict, ZeroBytes32))
            .to.be.revertedWith("LibVerdict: invalid bp sum");

    });

    it("should not be able to resolve a conflict without judge signature", async function () {
        // alice send an offer to bob
        // bob signed a payment request
        // alice pays
        // alice sign the conflict
        // alice resolves the conflict without judge signature

        const { deelit, alice, charlie, payment, paymentHash, offer } =
            await loadFixture(deployDeelitProtocolWithInitialPaymentFixture);
        
        const deelitAddress = await deelit.getAddress();
        
        const tx: LibTransaction.TransactionStruct = {
            payment,
            offer,
        };

        const conflict = ConflictUtils.builder().withFromAddress(alice.address).withPaymentHash(paymentHash).get();
        const conflictSignature = await alice.signTypedData(domain(deelitAddress), ConflictUtils.typedData, conflict);
        await deelit.connect(charlie).conflict(tx, conflict, conflictSignature);

        const verdict = VerdictUtils
            .builder()
            .withFromAddress(charlie.address)
            .withPaymentHash(paymentHash)
            .withPayeeBp(10000)
            .withPayerBp(0)
            .get();

        await expect(deelit.connect(alice).resolve(tx, verdict, ZeroBytes32))
            .to.be.revertedWith("DeelitProtocol: Invalid verdict issuer");

    });

    it("should not be able to resolve a conflict if conflict not exist", async function () {
        // alice send an offer to bob
        // bob signed a payment request
        // alice pays
        // alice resolves the conflict without conflict

        const { deelit, alice, charlie, payment, paymentHash, offer } =
            await loadFixture(deployDeelitProtocolWithInitialPaymentFixture);
        
        // grant charlie as judge
        await deelit.grantRole(await deelit.JUDGE_ROLE(), charlie.address);
        
        const tx: LibTransaction.TransactionStruct = {
            payment,
            offer,
        };

        const verdict = VerdictUtils
            .builder()
            .withFromAddress(charlie.address)
            .withPaymentHash(paymentHash)
            .withPayeeBp(10000)
            .withPayerBp(0)
            .get();

        const signature = await charlie.signTypedData(domain(await deelit.getAddress()), VerdictUtils.typedData, verdict);

        await expect(deelit.connect(alice).resolve(tx, verdict, ZeroBytes32))
            .to.be.revertedWith("DeelitProtocol: Payment not in conflict");
    });

    it("should not be able to resolve a conflict if conflict already resolved", async function () {
        const { deelit, alice, bob, charlie, payment, paymentHash, offer } =
            await loadFixture(deployDeelitProtocolWithInitialPaymentFixture);
        
        // grant charlie as judge
        await deelit.grantRole(await deelit.JUDGE_ROLE(), charlie.address);

        const deelitAddress = await deelit.getAddress();

        const tx: LibTransaction.TransactionStruct = {
            payment,
            offer,
        };

        const conflict = ConflictUtils.builder().withFromAddress(alice.address).withPaymentHash(paymentHash).get();
        const conflictSignature = await alice.signTypedData(domain(deelitAddress), ConflictUtils.typedData, conflict);
        await deelit.connect(charlie).conflict(tx, conflict, conflictSignature);

        const verdict = VerdictUtils
            .builder()
            .withFromAddress(charlie.address)
            .withPaymentHash(paymentHash)
            .withPayeeBp(10000)
            .withPayerBp(0)
            .get();
        const verdictHash = await VerdictUtils.hash(verdict, deelitAddress);
        const signature = await charlie.signTypedData(domain(deelitAddress), VerdictUtils.typedData, verdict);

        await deelit.connect(charlie).resolve(tx, verdict, ZeroBytes32);

        const state = await deelit.payments(paymentHash);
        expect(state.verdict).to.equals(verdictHash);

        await expect(deelit.connect(charlie).resolve(tx, verdict, ZeroBytes32))
            .to.be.revertedWith("DeelitProtocol: Payment already resolved");
    });
      
  });
});
