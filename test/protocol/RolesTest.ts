import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { deployDeelitProtocolFixture } from "../utils/fixtures";

describe("DeelitProtocol - Roles tests", function () {
  it("should admin update the roles", async function () {
    // Verify that AccessControl is working as expected but no need to fully test it as it is a standard contract
    const { deelit, owner, alice } = await loadFixture(
      deployDeelitProtocolFixture
    );

    const DEFAULT_ADMIN_ROLE = await deelit.DEFAULT_ADMIN_ROLE();

    await deelit.grantRole(DEFAULT_ADMIN_ROLE, alice.address);
    expect(await deelit.hasRole(DEFAULT_ADMIN_ROLE, alice.address)).to.equal(
      true
    );

    await deelit.revokeRole(DEFAULT_ADMIN_ROLE, owner.address);
    expect(await deelit.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.equal(
      false
    );

    await deelit.connect(alice).grantRole(DEFAULT_ADMIN_ROLE, owner.address);
    expect(await deelit.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.equal(
      true
    );
  });
});
