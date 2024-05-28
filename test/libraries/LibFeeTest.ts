import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { LibFeeMock } from "../../typechain-types";
import { LibFee } from "../../typechain-types/contracts/DeelitProtocol";
import { ZeroAddress } from "ethers";

describe("LibFee", function () {
	let lib: LibFeeMock;

	before(async () => {
		lib = await hre.ethers.deployContract("LibFeeMock");
	});

	describe("should calculate fee", () => {
		it("should calculate fee", async () => {
			// fee calculation is based on LibBp. see: LibBpTest.ts
			expect(await lib.calculateFees(100_00, { collector: ZeroAddress, amount_bp: 10_00 })).to.equal(10_00);
		});
	})
});
