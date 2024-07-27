import { expect } from "chai";
import hre from "hardhat";
import { LibBpMock } from "../../typechain-types";

describe("LibBp", function () {
	let lib: LibBpMock;

	before(async () => {
		lib = await hre.ethers.deployContract("LibBpMock");
	});

	describe("should calculate bp", () => {
		it("should calculate bp", async () => {
			expect(await lib.bp(100, 1_00)).to.equal(1); // 1% of 100
			expect(await lib.bp(100, 2_00)).to.equal(2); // 2% of 100
			expect(await lib.bp(100_000, 10_00)).to.equal(10_000); // 10% of 100,000	
			expect(await lib.bp(100_000, 1)).to.equal(10); // 0.01% of 100,000
			expect(await lib.bp(100, 10)).to.equal(0); // 0.1% of 100
			expect(await lib.bp(0, 10_00)).to.equal(0); // 10% of 0
			expect(await lib.bp(100, 0)).to.equal(0); // 0% of 100

			expect(await lib.bp(10_00, 21)).to.equal(2); // 2.1% of 1000
		});
	})
});
