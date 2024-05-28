import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { deployDeelitProtocolFixture } from "../utils/fixtures";

describe("DeelitProtocol - Deployment tests", function () {
  it("should set the right roles", async function () {
    const { deelit, owner } = await loadFixture(deployDeelitProtocolFixture);

    const hasRoleAdmin = await deelit.hasRole(
      await deelit.DEFAULT_ADMIN_ROLE(),
      owner.address
    );
    const hasRoleJudge = await deelit.hasRole(
      await deelit.JUDGE_ROLE(),
      owner.address
    );
    const hasRolePauser = await deelit.hasRole(
      await deelit.PAUSER_ROLE(),
      owner.address
    );

    expect(hasRoleAdmin).to.equal(true);
    expect(hasRoleJudge).to.equal(false);
    expect(hasRolePauser).to.equal(false);
  });

  it("should set the right fees", async function () {
    const { deelit, fees } = await loadFixture(deployDeelitProtocolFixture);

    const contractFees = await deelit.fees();
    expect(contractFees.collector).to.equal(fees.collector);
    expect(contractFees.amount_bp).to.equal(fees.amount_bp);
  });
});
