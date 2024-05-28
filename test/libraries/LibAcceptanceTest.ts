import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { LibAcceptanceMock } from "../../typechain-types";
import { LibAcceptance } from "../../typechain-types/contracts/DeelitProtocol";

describe("LibAcceptance", function () {
	let lib: LibAcceptanceMock;

	before(async () => {
		lib = await hre.ethers.deployContract("LibAcceptanceMock");
	});

	describe("should hash struct acceptance", () => {
		it("should hash struct acceptance", async () => {
			const types = {
				Acceptance: [
					{ name: 'from_address', type: 'address' },
					{ name: 'payment_hash', type: 'bytes32' },
				]
			}

			const acceptance: LibAcceptance.AcceptanceStruct = {
				from_address: "0x0000000000000000000000000000000000000001",
				payment_hash: ethers.encodeBytes32String("1"),
			};

			const hash = await lib.hash(acceptance);
			const ethersHash = ethers.TypedDataEncoder.hashStruct("Acceptance", types, acceptance);
			
			expect(hash).to.equal(ethersHash);
		});
	})
});
