import { expect } from "chai";
import hre from "hardhat";
import { LibBytesMock } from "../../typechain-types";

describe("LibBytes", function () {
	let lib: LibBytesMock;

	before(async () => {
		lib = await hre.ethers.deployContract("LibBytesMock");
	});

	describe("should convert bytes to address", () => {
		it("should convert bytes to address", async () => {
			expect(await lib.toAddress("0x0000000000000000000000000000000000000001")).to.equal("0x0000000000000000000000000000000000000001");
		});
		it("should revert if bytes length is not 20", async () => {
			await expect(lib.toAddress("0x00000000000000000000000000000000000001"))
				.to.revertedWith("LibBytes: toAddress - Invalid address length");
			await expect(lib.toAddress("0x000000000000000000000000000000000000000100"))
				.to.revertedWith("LibBytes: toAddress - Invalid address length");
		});
	})
});
