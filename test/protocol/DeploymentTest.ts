import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { deployDeelitProtocolFixture } from "../utils/fixtures";

describe("DeelitProtocol - Deployment tests", function () {
  it("should set the right roles", async function () {
    await loadFixture(deployDeelitProtocolFixture);
  });

  it("should set the right fees", async function () {
    const { deelit, protocolFees } = await loadFixture(deployDeelitProtocolFixture);

    const contractFees = await deelit.getFees();
    expect(contractFees.recipient).to.equal(protocolFees.recipient);
    expect(contractFees.amount_bp).to.equal(protocolFees.amount_bp);
  });
});
