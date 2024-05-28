import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { LibPaymentMock } from "../../typechain-types";
import { LibPayment } from "../../typechain-types/contracts/DeelitProtocol";

describe("LibPayment", function () {
	let lib: LibPaymentMock;

	before(async () => {
		lib = await hre.ethers.deployContract("LibPaymentMock");
	});

	describe("should hash struct payment", () => {
		it("should hash struct payment", async () => {
			const types = {
				Payment: [
					{ name: 'from_address', type: 'address' },
					{ name: 'destination_address', type: 'bytes' },
					{ name: 'offer_hash', type: 'bytes32' },
					{ name: 'expiration_time', type: 'uint256' },
					{ name: 'vesting_period', type: 'uint256' }
				]
			}

			const payment: LibPayment.PaymentStruct = {
				from_address: "0x0000000000000000000000000000000000000001",
				destination_address: "0x0000000000000000000000000000000000000002",
				offer_hash: ethers.encodeBytes32String("1"),
				expiration_time: 10,
				vesting_period: 2,
			};

			const hash = await lib.hash(payment);
			const ethersHash = ethers.TypedDataEncoder.hashStruct("Payment", types, payment);
			
			expect(hash).to.equal(ethersHash);
		});
	})
});
