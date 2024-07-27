import { expect } from "chai";
import hre from "hardhat";
import {
  deployERC20MockFixture,
  deployFeeRecipientFixture,
} from "../utils/fixtures";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("FeeRecipient tests", function () {
  it("should allow withdraw native", async function () {
    const { feeRecipient, feeRecipientAddress } = await loadFixture(deployFeeRecipientFixture);

    const [owner, alice] = await hre.ethers.getSigners();

    const aliceInitialBalance = await hre.ethers.provider.getBalance(
      alice.address,
    );

    owner.sendTransaction({
      to: feeRecipientAddress,
      value: hre.ethers.parseEther("3")
    });

    await feeRecipient
      .connect(owner)
      .withdraw(alice.address, hre.ethers.parseEther("1"));

    expect(await hre.ethers.provider.getBalance(alice.address)).to.be.equal(
      aliceInitialBalance + hre.ethers.parseEther("1"),
    );

    await feeRecipient
      .connect(owner)
      .withdraw(alice.address, hre.ethers.parseEther("2"));
    expect(await hre.ethers.provider.getBalance(alice.address)).to.be.equal(
      aliceInitialBalance + hre.ethers.parseEther("3"),
    );
  });

  it("should allow withdraw tokens", async function () {
    const { feeRecipient, feeRecipientAddress } = await loadFixture(
      deployFeeRecipientFixture,
    );

    const { erc20, erc20Address } = await deployERC20MockFixture();

    const [owner, alice] = await hre.ethers.getSigners();

    await erc20
      .connect(owner)
      .transfer(feeRecipientAddress, hre.ethers.parseEther("3"));
    const aliceInitialBalance = await erc20.balanceOf(alice.address);

    await feeRecipient
      .connect(owner)
      .withdrawErc20(erc20Address, alice.address, hre.ethers.parseEther("1"));
    expect(await erc20.balanceOf(alice.address)).to.be.equal(
      aliceInitialBalance + hre.ethers.parseEther("1"),
    );

    await feeRecipient
      .connect(owner)
      .withdrawErc20(erc20Address, alice.address, hre.ethers.parseEther("2"));
    expect(await erc20.balanceOf(alice.address)).to.be.equal(
      aliceInitialBalance + hre.ethers.parseEther("3"),
    );
  });
});
