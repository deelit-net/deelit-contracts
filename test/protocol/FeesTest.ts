import { expect } from "chai";
import { LibFee } from "../../typechain-types/contracts/DeelitProtocol";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { deployDeelitProtocolFixture } from "../utils/fixtures";

describe("DeelitProtocol - Fees tests", function () {
  it("should admin update the fees", async function () {
    const { deelit, owner } = await loadFixture(deployDeelitProtocolFixture);

    const newFees: LibFee.FeeStruct = {
      collector: "0x0000000000000000000000000000000000000002",
      amount_bp: 2000n,
    };

    await deelit.connect(owner).setFees(newFees);

    const contractFees = await deelit.fees();
    expect(contractFees.collector).to.equal(newFees.collector);
    expect(contractFees.amount_bp).to.equal(newFees.amount_bp);
  });

  it("should not allow non-admin to update the fees", async function () {
    const { deelit, alice } = await loadFixture(deployDeelitProtocolFixture);

    const newFees: LibFee.FeeStruct = {
      collector: "0x0000000000000000000000000000000000000002",
      amount_bp: 2000n,
    };

    await expect(
      deelit.connect(alice).setFees(newFees)
    ).to.be.revertedWithCustomError(deelit, "AccessControlUnauthorizedAccount");
  });
});
