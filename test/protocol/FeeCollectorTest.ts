import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { deployERC20MockFixture, deployFeeRecipientFixture } from "../utils/fixtures";
import { expect } from "chai";


describe("FeeRecipient", function () {
    describe("Deployment", function () {
      it("should be able to deploy fee collector", async function () {
        await loadFixture(deployFeeRecipientFixture);
      });
    });

    describe("Withdraw", function () {
        it ("should be able to withdraw fees", async function () {
            const { feeRecipient, feeRecipientAddress, owner } = await loadFixture(deployFeeRecipientFixture);

            const [_, alice] = await hre.ethers.getSigners();

            const fee = 1000n;
            owner.sendTransaction({to: feeRecipientAddress, value: fee});

            const aliceInitialBalance = await hre.ethers.provider.getBalance(alice);

            await feeRecipient.withdraw(alice.address, fee);

            expect(await hre.ethers.provider.getBalance(feeRecipient)).to.equal(0);
            expect(await hre.ethers.provider.getBalance(alice)).to.equal(aliceInitialBalance + fee)
        });

        it ("should be able to withdraw ERC20 fees", async function () {
            const { feeRecipient, feeRecipientAddress } = await loadFixture(deployFeeRecipientFixture);

            const { erc20, erc20Address } = await deployERC20MockFixture();

            const [_, alice] = await hre.ethers.getSigners();

            const fee = 1000n;
            await erc20.transfer(feeRecipientAddress, fee);

            const aliceInitialBalance = await erc20.balanceOf(alice.address);
            await feeRecipient.withdrawErc20(erc20Address, alice.address, fee);

            expect(await erc20.balanceOf(feeRecipientAddress)).to.equal(0);
            expect(await erc20.balanceOf(alice.address)).to.equal(aliceInitialBalance + fee);

        });

        it ("should not be able to withdraw fees if not admin", async function () {
        });
    });
});