import { expect } from "chai";
import hre from "hardhat";
import { ZeroAddress } from "ethers";
import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {
  LibLottery,
  LibOffer,
  LibPayment,
} from "../../typechain-types/contracts/lottery/Lottery";
import { deployLotteryFixture } from "../utils/fixtures";
import {
  A_DAY,
  calculateFee, domain,
  LotteryUtils, OfferUtils,
  PaymentUtils,
  ZeroBytes32
} from "../utils/utils";

const LOTTERY_NONE_STATUS = 0;
const LOTTERY_OPEN_STATUS = 1;
const LOTTERY_DRAWN_STATUS = 2;
const LOTTERY_PAID_STATUS = 3;
const LOTTERY_CANCELLED_STATUS = 4;

describe("Lottery", function () {
  // We define a fixture to reuse the same setup in every test

  describe("Lottery Creation", function () {
    it("Should create a new lottery", async function () {
      const { lottery, owner, lotteryFees, protocolFees, feeRecipientAddress } =
        await loadFixture(deployLotteryFixture);

      const lotteryDetails: LibLottery.LotteryStruct = {
        from_address: owner.address,
        nb_tickets: 4,
        ticket_price: hre.ethers.parseEther("1"),
        product_hash: hre.ethers.keccak256(
          hre.ethers.toUtf8Bytes("product_hash"),
        ),
        fee: lotteryFees,
        protocol_fee: protocolFees,
        token_address: ZeroAddress,

        expiration_time: new Date().getTime() + A_DAY, // T + 1 day
      };

      await expect(lottery.createLottery(lotteryDetails)).to.emit(
        lottery,
        "Created",
      );
    });
  });

  describe("Lottery Participation", function () {
    it("Should allow participation in an open lottery", async function () {
      const { lottery, participant1, lotteryFees, protocolFees } =
        await loadFixture(deployLotteryFixture);

      // // Create a lottery first
      const lotteryDetails = {
        from_address: participant1.address,
        nb_tickets: 4,
        ticket_price: hre.ethers.parseEther("1"),
        product_hash: hre.ethers.keccak256(
          hre.ethers.toUtf8Bytes("lotteryDetails"),
        ),
        token_address: ZeroAddress,
        fee: lotteryFees,
        protocol_fee: protocolFees,
        expiration_time: new Date().getTime() + A_DAY, // T + 1 day
      };

      const protocolFeePrice = calculateFee(
        lotteryDetails.ticket_price,
        BigInt(protocolFees.amount_bp),
      );
      const lotteryFeePrice = calculateFee(
        lotteryDetails.ticket_price,
        BigInt(lotteryFees.amount_bp),
      );
      const ticketTotalPrice =
        lotteryDetails.ticket_price + protocolFeePrice + lotteryFeePrice;

      await lottery.createLottery(lotteryDetails);
      const lotteryHash = await LotteryUtils.hash(lotteryDetails);

      await expect(
        lottery
          .connect(participant1)
          .participate(lotteryDetails, { value: ticketTotalPrice }),
      )
        .to.emit(lottery, "Participated")
        .withArgs(lotteryHash, participant1.address);

      expect(await lottery.isParticipant(lotteryHash, participant1.address)).to
        .be.true;
    });

    it("Should not allow participation in a filled lottery", async function () {
      const {
        lottery,
        participant1,
        participant2,
        participant3,
        lotteryFees,
        protocolFees,
      } = await loadFixture(deployLotteryFixture);

      // Create a lottery first
      const lotteryDetails = {
        from_address: participant1.address,
        nb_tickets: 2,
        ticket_price: hre.ethers.parseEther("1"),
        product_hash: hre.ethers.keccak256(
          hre.ethers.toUtf8Bytes("lotteryDetails"),
        ),
        token_address: ZeroAddress,
        fee: lotteryFees,
        protocol_fee: protocolFees,
        expiration_time: new Date().getTime() + A_DAY,
      };

      const protocolFeePrice = calculateFee(
        lotteryDetails.ticket_price,
        BigInt(protocolFees.amount_bp),
      );
      const lotteryFeePrice = calculateFee(
        lotteryDetails.ticket_price,
        BigInt(lotteryFees.amount_bp),
      );
      const ticketTotalPrice =
        lotteryDetails.ticket_price + protocolFeePrice + lotteryFeePrice;

      await lottery.createLottery(lotteryDetails);

      // Participate in the lottery
      await lottery
        .connect(participant1)
        .participate(lotteryDetails, { value: ticketTotalPrice });
      await lottery
        .connect(participant2)
        .participate(lotteryDetails, { value: ticketTotalPrice });

      // Try to participate again
      await expect(
        lottery
          .connect(participant3)
          .participate(lotteryDetails, { value: hre.ethers.parseEther("1") }),
      ).to.be.revertedWith("Lottery: already filled");
    });
  });

  describe("Lottery Drawing", function () {
    it("Should successfully draw a winner for a filled lottery", async function () {
      const {
        lottery,
        owner,
        participant1,
        participant2,
        randomRequestPrice,
        lotteryFees,
        protocolFees,
      } = await loadFixture(deployLotteryFixture);

      // Create a lottery first
      const lotteryDetails = {
        from_address: participant1.address,
        nb_tickets: 2,
        ticket_price: hre.ethers.parseEther("1"),
        product_hash: hre.ethers.keccak256(
          hre.ethers.toUtf8Bytes("lotteryDetails"),
        ),
        token_address: ZeroAddress,
        fee: lotteryFees,
        protocol_fee: protocolFees,
        expiration_time: new Date().getTime() + A_DAY, // T + 1 day
      };
      const protocolFeePrice = calculateFee(
        lotteryDetails.ticket_price,
        BigInt(protocolFees.amount_bp),
      );
      const lotteryFeePrice = calculateFee(
        lotteryDetails.ticket_price,
        BigInt(lotteryFees.amount_bp),
      );
      const ticketTotalPrice =
        lotteryDetails.ticket_price + protocolFeePrice + lotteryFeePrice;

      await lottery.createLottery(lotteryDetails);

      const lotteryHash = await LotteryUtils.hash(lotteryDetails);

      // Participate in the lottery
      await lottery
        .connect(participant1)
        .participate(lotteryDetails, { value: ticketTotalPrice });
      await lottery
        .connect(participant2)
        .participate(lotteryDetails, { value: ticketTotalPrice });

      await expect(
        lottery
          .connect(owner)
          .draw(lotteryDetails, { value: randomRequestPrice }),
      ).to.emit(lottery, "Drawn");

      expect(await lottery.getLotteryStatus(lotteryHash)).to.deep.equal([
        LOTTERY_DRAWN_STATUS,
        2,
        ZeroAddress,
      ]);
    });

    it("Should not allow drawing for an unfilled lottery", async function () {
      const {
        lottery,
        owner,
        participant1,
        randomRequestPrice,
        lotteryFees,
        protocolFees,
      } = await loadFixture(deployLotteryFixture);

      // Create a lottery first
      const lotteryDetails = {
        from_address: participant1.address,
        nb_tickets: 2,
        ticket_price: hre.ethers.parseEther("1"),
        product_hash: hre.ethers.keccak256(
          hre.ethers.toUtf8Bytes("lotteryDetails"),
        ),
        token_address: ZeroAddress,
        fee: lotteryFees,
        protocol_fee: protocolFees,
        expiration_time: new Date().getTime() + A_DAY, // T + 1 day
      };
      const protocolFeePrice = calculateFee(
        lotteryDetails.ticket_price,
        BigInt(protocolFees.amount_bp),
      );
      const lotteryFeePrice = calculateFee(
        lotteryDetails.ticket_price,
        BigInt(lotteryFees.amount_bp),
      );
      const ticketTotalPrice =
        lotteryDetails.ticket_price + protocolFeePrice + lotteryFeePrice;

      await lottery.createLottery(lotteryDetails);

      // Add only one participant
      await lottery
        .connect(participant1)
        .participate(lotteryDetails, { value: ticketTotalPrice });

      // Try to draw
      await expect(
        lottery
          .connect(owner)
          .draw(lotteryDetails, { value: randomRequestPrice }),
      ).to.be.revertedWith("Lottery: not filled");
    });
  });

  describe("Lottery Payment", function () {
    it("Should successfully pay out the lottery prize", async function () {
      const {
        lottery,
        owner,
        participant1,
        participant2,
        participant3,
        randomRequestPrice,
        deelit,
        deelitAddress,
        randomProducerMock,
        lotteryFees,
        protocolFees,
      } = await loadFixture(deployLotteryFixture);

      // Create a lottery first
      const lotteryDetails = {
        from_address: participant1.address,
        nb_tickets: 3n,
        ticket_price: hre.ethers.parseEther("1"),
        product_hash: hre.ethers.keccak256(
          hre.ethers.toUtf8Bytes("lotteryDetails"),
        ),
        token_address: ZeroAddress,
        fee: lotteryFees,
        protocol_fee: protocolFees,
        expiration_time: new Date().getTime() + A_DAY, // T + 1 day
      };
      const protocolFeePrice = calculateFee(
        lotteryDetails.ticket_price,
        BigInt(protocolFees.amount_bp),
      );
      const lotteryFeePrice = calculateFee(
        lotteryDetails.ticket_price,
        BigInt(lotteryFees.amount_bp),
      );
      const ticketTotalPrice =
        lotteryDetails.ticket_price + protocolFeePrice + lotteryFeePrice;

      await lottery.createLottery(lotteryDetails);
      const lotteryHash = await LotteryUtils.hash(lotteryDetails);

      // Participate in the lottery
      await lottery
        .connect(participant1)
        .participate(lotteryDetails, { value: ticketTotalPrice });
      await lottery
        .connect(participant2)
        .participate(lotteryDetails, { value: ticketTotalPrice });
      await lottery
        .connect(participant3)
        .participate(lotteryDetails, { value: ticketTotalPrice });

      // Draw the lottery
      await lottery
        .connect(owner)
        .draw(lotteryDetails, { value: randomRequestPrice });

      // Compute the winner
      await lottery.winner(lotteryHash);

      // Retrieve the winner address
      const [, , winner] = await lottery.getLotteryStatus(lotteryHash);

      // Compute the protocol offer price
      const offerPrice =
        lotteryDetails.ticket_price * lotteryDetails.nb_tickets;

      // Pay the lottery
      const offer: LibOffer.OfferStruct = {
        from_address: winner, // offer originator is the lottery winner
        product_hash: lotteryDetails.product_hash, // product hash must match the lottery product hash
        price: offerPrice, // price must match the total lottery prize minus the protocol fee
        currency_code: "ETH", // actually not used
        chain_id: 1, // chain id must match the lottery chain id
        token_address: lotteryDetails.token_address, // token address must match the lottery token address
        shipment_type: 1, // actually not used
        shipment_price: 0, // shipment price must be 0
        expiration_time: new Date().getTime() + A_DAY, // expiration time must be greater than the current time
      };

      const payment: LibPayment.PaymentStruct = {
        from_address: owner.address, // payment originator (might be the lottery owner)
        destination_address: "0x0000000000000000000000000000000000000002", // payment destination (might be eq to from_address)
        offer_hash: OfferUtils.hash(offer, deelitAddress), // offer hash must match the tx offer hash
        expiration_time: new Date().getTime() + A_DAY, // expiration time must be greater than the current time
        vesting_period: 30 * A_DAY, // 30 days
      };

      const paymentSignature = await owner.signTypedData(
        domain(deelitAddress),
        PaymentUtils.typedData,
        payment,
      );

      await expect(
        lottery
          .connect(owner)
          .pay(
            lotteryDetails,
            { offer: offer, payment: payment },
            paymentSignature,
          ),
      ).to.emit(lottery, "Paid");

      expect(
        await lottery.getLotteryStatus(await LotteryUtils.hash(lotteryDetails)),
      ).to.deep.equal([LOTTERY_PAID_STATUS, 3, winner]);

      const paymentState = await deelit.getPaymentState(PaymentUtils.hash(payment, deelitAddress));
      expect(paymentState.payer).to.be.equal(winner);
      expect(paymentState.acceptance).to.be.equal(ZeroBytes32);
      expect(paymentState.conflict).to.be.equal(ZeroBytes32);
      expect(paymentState.verdict).to.be.equal(ZeroBytes32);
      expect(paymentState.vesting).to.be.gt(0);
    });
  });

  describe("Lottery Cancellation", function () {
    it("Should allow cancellation by admin", async function () {
      const { lottery, owner, participant1, lotteryFees, protocolFees } =
        await loadFixture(deployLotteryFixture);

      // Create a lottery first
      const lotteryDetails = {
        from_address: owner.address,
        nb_tickets: 2,
        ticket_price: hre.ethers.parseEther("1"),
        product_hash: hre.ethers.keccak256(
          hre.ethers.toUtf8Bytes("lotteryDetails"),
        ),
        token_address: ZeroAddress,
        fee: lotteryFees,
        protocol_fee: protocolFees,
        expiration_time: new Date().getTime() + A_DAY, // T + 1 day
      };

      await lottery.createLottery(lotteryDetails);

      // Try to cancel
      await lottery.connect(owner).cancel(lotteryDetails);

      // check status
      expect(
        await lottery.getLotteryStatus(await LotteryUtils.hash(lotteryDetails)),
      ).to.deep.equal([LOTTERY_CANCELLED_STATUS, 0, ZeroAddress]);
    });

    it("Should not allow cancellation of a drawn lottery", async function () {
      const {
        lottery,
        owner,
        participant1,
        participant2,
        randomRequestPrice,
        lotteryFees,
        protocolFees,
      } = await loadFixture(deployLotteryFixture);

      // Create a lottery first
      const lotteryDetails = {
        from_address: owner.address,
        nb_tickets: 2,
        ticket_price: hre.ethers.parseEther("1"),
        product_hash: hre.ethers.keccak256(
          hre.ethers.toUtf8Bytes("lotteryDetails"),
        ),
        token_address: ZeroAddress,
        fee: lotteryFees,
        protocol_fee: protocolFees,
        expiration_time: new Date().getTime() + A_DAY, // T + 1 day
      };
      const protocolFeePrice = calculateFee(
        lotteryDetails.ticket_price,
        BigInt(protocolFees.amount_bp),
      );
      const lotteryFeePrice = calculateFee(
        lotteryDetails.ticket_price,
        BigInt(lotteryFees.amount_bp),
      );
      const ticketTotalPrice =
        lotteryDetails.ticket_price + protocolFeePrice + lotteryFeePrice;

      await lottery.createLottery(lotteryDetails);

      // Participate in the lottery
      await lottery
        .connect(participant1)
        .participate(lotteryDetails, { value: ticketTotalPrice });
      await lottery
        .connect(participant2)
        .participate(lotteryDetails, { value: ticketTotalPrice });

      // Draw the lottery
      await lottery
        .connect(owner)
        .draw(lotteryDetails, { value: randomRequestPrice });

      // Try to cancel
      await expect(
        lottery.connect(owner).cancel(lotteryDetails),
      ).to.be.revertedWith("Lottery: already drawn");
    });

    it("Should not allow cancelation if expiration time not reached", async function () {
      const { lottery, owner, participant1, lotteryFees, protocolFees } =
        await loadFixture(deployLotteryFixture);

      // Create a lottery first
      const lotteryDetails = {
        from_address: owner.address,
        nb_tickets: 2,
        ticket_price: hre.ethers.parseEther("1"),
        product_hash: hre.ethers.keccak256(
          hre.ethers.toUtf8Bytes("lotteryDetails"),
        ),
        token_address: ZeroAddress,
        fee: lotteryFees,
        protocol_fee: protocolFees,
        expiration_time: new Date().getTime() + A_DAY, // T + 1 day
      };

      await lottery.createLottery(lotteryDetails);

      // Try to cancel
      await expect(
        lottery.connect(participant1).cancel(lotteryDetails),
      ).to.be.revertedWith("Lottery: not admin");
    });

    it("Should allow cancelation if expiration time reached", async function () {
      const { lottery, owner, participant1, lotteryFees, protocolFees } =
        await loadFixture(deployLotteryFixture);

      // Create a lottery first
      const lotteryDetails = {
        from_address: owner.address,
        nb_tickets: 2,
        ticket_price: hre.ethers.parseEther("1"),
        product_hash: hre.ethers.keccak256(
          hre.ethers.toUtf8Bytes("lotteryDetails"),
        ),
        token_address: ZeroAddress,
        fee: lotteryFees,
        protocol_fee: protocolFees,
        expiration_time: new Date().getTime() + A_DAY, // T + 1 day
      };

      await lottery.createLottery(lotteryDetails);

      // Wait for expiration time
      time.increaseTo(lotteryDetails.expiration_time);

      // Try to cancel
      await lottery.connect(participant1).cancel(lotteryDetails);

      // check status
      expect(
        await lottery.getLotteryStatus(await LotteryUtils.hash(lotteryDetails)),
      ).to.deep.equal([LOTTERY_CANCELLED_STATUS, 0, ZeroAddress]);
    });
  });

  describe("Ticket Redemption", function () {
    it("Should allow ticket redemption for a cancelled lottery", async function () {
      const { lottery, owner, participant1, lotteryFees, protocolFees } =
        await loadFixture(deployLotteryFixture);

      // Create a lottery first
      const lotteryDetails = {
        from_address: owner.address,
        nb_tickets: 2,
        ticket_price: hre.ethers.parseEther("1"),
        product_hash: hre.ethers.keccak256(
          hre.ethers.toUtf8Bytes("lotteryDetails"),
        ),
        token_address: ZeroAddress,
        fee: lotteryFees,
        protocol_fee: protocolFees,
        expiration_time: new Date().getTime() + A_DAY, // T + 1 day
      };

      await lottery.createLottery(lotteryDetails);

      // add participants
      await lottery
        .connect(participant1)
        .participate(lotteryDetails, { value: hre.ethers.parseEther("3") });

      // Cancel the lottery
      await lottery.connect(owner).cancel(lotteryDetails);

      // Redeem ticket
      const totalParticipation =
        hre.ethers.parseEther("1") +
        calculateFee(
          hre.ethers.parseEther("1"),
          BigInt(protocolFees.amount_bp),
        ) +
        calculateFee(hre.ethers.parseEther("1"), BigInt(lotteryFees.amount_bp));

      const participant1BalanceBefore = await hre.ethers.provider.getBalance(
        participant1.address,
      );
      await lottery.connect(owner).redeem(lotteryDetails, participant1);
      const participant1BalanceAfter = await hre.ethers.provider.getBalance(
        participant1.address,
      );

      // check status
      expect(
        await lottery.getLotteryStatus(await LotteryUtils.hash(lotteryDetails)),
      ).to.deep.equal([LOTTERY_CANCELLED_STATUS, 1, ZeroAddress]);

      // check balance
      expect(participant1BalanceAfter).to.be.eq(
        participant1BalanceBefore + totalParticipation,
      );
    });

    it("Should not allow ticket redemption for an active lottery", async function () {
      const {
        lottery,
        owner,
        participant1,
        participant2,
        lotteryFees,
        protocolFees,
      } = await loadFixture(deployLotteryFixture);

      // Create a lottery first
      const lotteryDetails = {
        from_address: owner.address,
        nb_tickets: 2,
        ticket_price: hre.ethers.parseEther("1"),
        product_hash: hre.ethers.keccak256(
          hre.ethers.toUtf8Bytes("lotteryDetails"),
        ),
        token_address: ZeroAddress,
        fee: lotteryFees,
        protocol_fee: protocolFees,
        expiration_time: new Date().getTime() + A_DAY, // T + 1 day
      };

      await lottery.createLottery(lotteryDetails);

      // add participants
      await lottery
        .connect(participant1)
        .participate(lotteryDetails, { value: hre.ethers.parseEther("3") });

      // Try to redeem ticket
      await expect(
        lottery.connect(owner).redeem(lotteryDetails, participant1),
      ).to.be.revertedWith("Lottery: not canceled");
    });

    it("Should not allow a double ticket redemption", async function () {
      const { lottery, owner, participant1, lotteryFees, protocolFees } =
        await loadFixture(deployLotteryFixture);

      // Create a lottery first
      const lotteryDetails = {
        from_address: owner.address,
        nb_tickets: 2,
        ticket_price: hre.ethers.parseEther("1"),
        product_hash: hre.ethers.keccak256(
          hre.ethers.toUtf8Bytes("lotteryDetails"),
        ),
        token_address: ZeroAddress,
        fee: lotteryFees,
        protocol_fee: protocolFees,
        expiration_time: new Date().getTime() + A_DAY, // T + 1 day
      };

      await lottery.createLottery(lotteryDetails);

      // add participants
      await lottery
        .connect(participant1)
        .participate(lotteryDetails, { value: hre.ethers.parseEther("3") });

      // Cancel the lottery

      await lottery.connect(owner).cancel(lotteryDetails);

      // Redeem ticket
      await lottery.connect(owner).redeem(lotteryDetails, participant1);

      // Try to redeem ticket again
      await expect(
        lottery.connect(owner).redeem(lotteryDetails, participant1),
      ).to.be.revertedWith("Lottery: already redeemed");
    });
  });
});
