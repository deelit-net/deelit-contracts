import { expect } from "chai";
import hre from "hardhat";
import { LibFeeMock } from "../../typechain-types";
import { LibFee } from "../../typechain-types/contracts/fee/FeeCollector";

describe("LibFee", function () {
  let lib: LibFeeMock;

  before(async () => {
    lib = await hre.ethers.deployContract("LibFeeMock");
  });

  describe("should calculate fee", () => {
    it("should calculate fee", async () => {
      // fee calculation is based on LibBp. see: LibBpTest.ts
      expect(
        await lib.calculateFees(100_000, 1_00),
      ).to.equal(1_000);
      expect(
        await lib.calculateFees(100_000, 1 ),
      ).to.equal(10);
    });
  });

  describe("should hash struct fee", function () {
    it("should hash struct fee", async () => {
      const types = {
        Fee: [
          { name: "recipient", type: "address" },
          { name: "amount_bp", type: "uint48" },
        ],
      };

      const fee: LibFee.FeeStruct = {
        recipient: "0x0000000000000000000000000000000000000001",
        amount_bp: 10_00n,
      };

      const hash = await lib.hash(fee);
      const ethersHash = hre.ethers.TypedDataEncoder.hashStruct(
        "Fee",
        types,
        fee,
      );

      expect(hash).to.equal(ethersHash);
    });
  });
});
