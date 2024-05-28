
import { expect } from "chai";
import hre from "hardhat";
import { deployERC20MockFixture, deployFeeCollectorFixture } from "./utils/fixtures";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

  describe("FeeCollector tests", function () {
    it("should allow withdraw native", async function () {
        const { feeCollector } = await loadFixture(deployFeeCollectorFixture);

        const [owner, alice] = await hre.ethers.getSigners();

        const aliceInitialBalance = await hre.ethers.provider.getBalance(alice.address);

        await feeCollector.connect(owner).collect({ value: hre.ethers.parseEther("3") });
        await feeCollector.connect(owner).withdraw(alice.address, hre.ethers.parseEther("1"));

        expect (await hre.ethers.provider.getBalance(alice.address)).to.be.equal(aliceInitialBalance + hre.ethers.parseEther("1"));

        await feeCollector.connect(owner).withdraw(alice.address, hre.ethers.parseEther("2"));
        expect (await hre.ethers.provider.getBalance(alice.address)).to.be.equal(aliceInitialBalance + hre.ethers.parseEther("3"));

    });

    it("should allow withdraw tokens", async function () {
      const { feeCollector, feeCollectorAddress } = await loadFixture(deployFeeCollectorFixture);

      const { erc20, erc20Address } = await deployERC20MockFixture()

      const [owner, alice] = await hre.ethers.getSigners();

      await erc20.connect(owner).transfer(feeCollectorAddress, hre.ethers.parseEther("3"));
      const aliceInitialBalance = await erc20.balanceOf(alice.address);

      await feeCollector.connect(owner).withdrawErc20(erc20Address, alice.address, hre.ethers.parseEther("1"));
      expect (await erc20.balanceOf(alice.address)).to.be.equal(aliceInitialBalance + hre.ethers.parseEther("1"));

      await feeCollector.connect(owner).withdrawErc20(erc20Address, alice.address, hre.ethers.parseEther("2"));
      expect (await erc20.balanceOf(alice.address)).to.be.equal(aliceInitialBalance + hre.ethers.parseEther("3"));
    });
  });
  