import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { deployAccessManagerFixture } from "../utils/fixtures";
import hre from "hardhat";

describe("DeelitAccessManager", function () {
  describe("Deployment", () => {
    it("Should deploy DeelitAccessManager", async () => {
      const { accessManager, ADMIN_ROLE, JUDGE_ROLE, PAUSER_ROLE, owner } =
        await loadFixture(deployAccessManagerFixture);

      const [hasAdminRole] = await accessManager.hasRole(
        ADMIN_ROLE,
        owner.address,
      );
      const [hasJudgeRole] = await accessManager.hasRole(
        JUDGE_ROLE,
        owner.address,
      );
      const [hasPauserRole] = await accessManager.hasRole(
        PAUSER_ROLE,
        owner.address,
      );

      expect(hasAdminRole).to.be.true;
      expect(hasJudgeRole).to.be.false;
      expect(hasPauserRole).to.be.false;
    });

    it("Should allow to update roles by admin", async () => {
      const { accessManager, JUDGE_ROLE, PAUSER_ROLE, owner } =
        await loadFixture(deployAccessManagerFixture);

      const [_, alice, bob] = await hre.ethers.getSigners();

      await accessManager.grantRole(JUDGE_ROLE, alice.address, 0);
      await accessManager.grantRole(PAUSER_ROLE, bob.address, 0);

      const [hasAliceJudgeRole] = await accessManager.hasRole(JUDGE_ROLE, alice.address);
      const [hasBobauserRole] = await accessManager.hasRole(PAUSER_ROLE, bob.address); 

      expect(hasAliceJudgeRole).to.be.true;
      expect(hasBobauserRole).to.be.true;
    });

    it("Should not allow to update roles by non-admin", async () => {
      const { accessManager, JUDGE_ROLE, PAUSER_ROLE, owner } =
        await loadFixture(deployAccessManagerFixture);
        
      const [_, alice, bob] = await hre.ethers.getSigners();

      await expect(
        accessManager.connect(alice).grantRole(JUDGE_ROLE, bob.address, 0)
      ).to.be.revertedWithCustomError(accessManager, "AccessManagerUnauthorizedAccount");

      await expect(
        accessManager.connect(alice).grantRole(PAUSER_ROLE, bob.address, 0)
      ).to.be.revertedWithCustomError(accessManager, "AccessManagerUnauthorizedAccount");
    });
  });
});
