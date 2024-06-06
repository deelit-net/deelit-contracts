import { expect } from "chai";
import hre from "hardhat";
import { LibFeeMock } from "../../typechain-types";
import { ZeroAddress } from "ethers";

describe("LibFee", function () {
	let lib: LibFeeMock;

	before(async () => {
		lib = await hre.ethers.deployContract("LibFeeMock");
	});

	describe("should calculate fee", () => {
		it("should calculate fee", async () => {
			// fee calculation is based on LibBp. see: LibBpTest.ts
			expect(await lib.calculateFees(100_000, { collector: ZeroAddress, amount_bp: 1_00 })).to.equal(1_000);
			expect(await lib.calculateFees(100_000, { collector: ZeroAddress, amount_bp: 1 })).to.equal(10);
		});
	})
});
