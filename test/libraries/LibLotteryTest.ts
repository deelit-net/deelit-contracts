import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { LibLotteryMock } from "../../typechain-types";
import { LotteryTypedData } from "../utils/types";
import { ZeroAddress } from "ethers";
import { LibLottery } from "../../typechain-types/contracts/lottery/Lottery";

describe("LibLottery", function () {
	let lib: LibLotteryMock;

	before(async () => {
		lib = await hre.ethers.deployContract("LibLotteryMock");
	});
	
	describe("should hash struct lottery", () => {
		it("should hash struct lottery", async () => {
			const types = LotteryTypedData;

			const lottery: LibLottery.LotteryStruct = {
				from_address: "0x0000000000000000000000000000000000000001",
				nb_tickets: 4,
				ticket_price: hre.ethers.parseEther("1"),
				product_hash: ethers.keccak256(ethers.toUtf8Bytes("product_hash")),
				token_address: ZeroAddress,
				fee: {
					recipient: "0x0000000000000000000000000000000000000002",
					amount_bp: 10_00,
				},
				protocol_fee: {
					recipient: "0x0000000000000000000000000000000000000002",
					amount_bp: 20_00,
				},
				expiration_time: new Date().getTime() + 24 * 60 * 60, // T + 1 day
			};

			const hash = await lib.hash(lottery);
			const ethersHash = ethers.TypedDataEncoder.hashStruct("Lottery", types, lottery);
			
			expect(hash).to.equal(ethersHash);
		});
	})
});
