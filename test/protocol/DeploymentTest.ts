import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { deployDeelitProtocolFixture } from "../utils/fixtures";

describe("DeelitProtocol - Deployment tests", function () {
  it("should set the right roles", async function () {
    await loadFixture(deployDeelitProtocolFixture);
  });

  it("should set the right fees", async function () {
    const { deelit, fees } = await loadFixture(deployDeelitProtocolFixture);

    const contractFees = await deelit.fees();
    expect(contractFees.collector).to.equal(fees.collector);
    expect(contractFees.amount_bp).to.equal(fees.amount_bp);
  });
});
