import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { LibConflictMock } from "../../typechain-types";
import { LibConflict } from "../../typechain-types/contracts/DeelitProtocol";

describe("LibConflict", function () {
	let lib: LibConflictMock;

	before(async () => {
		lib = await hre.ethers.deployContract("LibConflictMock");
	});

	describe("should hash struct conflict", () => {
		it("should hash struct conflict", async () => {
			const types = {
				Conflict: [
					{ name: 'from_address', type: 'address' },
					{ name: 'payment_hash', type: 'bytes32' },
				]
			}

			const conflict: LibConflict.ConflictStruct = {
				from_address: "0x0000000000000000000000000000000000000001",
				payment_hash: ethers.encodeBytes32String("1"),
			};

			const hash = await lib.hash(conflict);
			const ethersHash = ethers.TypedDataEncoder.hashStruct("Conflict", types, conflict);
			
			expect(hash).to.equal(ethersHash);
		});
	})
});
