import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { LibVerdictMock } from "../../typechain-types";
import { LibVerdict } from "../../typechain-types/contracts/DeelitProtocol";
import { VerdictTypedData } from "../utils/types";

describe("LibVerdict", function () {
	let lib: LibVerdictMock;

	before(async () => {
		lib = await hre.ethers.deployContract("LibVerdictMock");
	});
	
	describe("should hash struct verdict", () => {
		it("should hash struct verdict", async () => {
			const types = VerdictTypedData;

			const verdict: LibVerdict.VerdictStruct = {
				from_address: "0x0000000000000000000000000000000000000001",
				payment_hash: ethers.encodeBytes32String("1"),
				payer_bp: 10_00,
				payee_bp: 90_00,
			};

			const hash = await lib.hash(verdict);
			const ethersHash = ethers.TypedDataEncoder.hashStruct("Verdict", types, verdict);
			
			expect(hash).to.equal(ethersHash);
		});
	})
});
