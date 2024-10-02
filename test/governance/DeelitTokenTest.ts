import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { deployDeelitTokenFixture } from "../utils/fixtures";
import { parseUnits } from "ethers";

describe("DeelitToken", function () {
  describe("Deployment", () => {
    it("Should deploy DeelitToken", async () => {
      const { deelitToken, owner } = await loadFixture(
        deployDeelitTokenFixture,
      );

      const expectSupply = parseUnits("1000000000", 18);
      const currentSupply = await deelitToken.totalSupply();

      expect(currentSupply).to.be.eq(expectSupply);
      expect(await deelitToken.balanceOf(owner.address)).to.be.eq(expectSupply);
    });
  });
});
