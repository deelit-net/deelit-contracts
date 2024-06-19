import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { deployERC20MockFixture, deployFeeCollectorFixture } from "../utils/fixtures";
import { expect } from "chai";


describe("FeeCollector", function () {
    describe("Deployment", function () {
      it("should be able to deploy fee collector", async function () {
        await loadFixture(deployFeeCollectorFixture);
      });
    });
    
    describe("Collect", function () {
        it("should be able to collect fees", async function () {
            const { feeCollector } = await loadFixture(deployFeeCollectorFixture);

            const fee = 1000n;
            await feeCollector.collect({value: fee});

            expect(await hre.ethers.provider.getBalance(feeCollector)).to.equal(fee);
        });

        it("should be able to collect ERC20 fees", async function () {
            const { feeCollector, feeCollectorAddress } = await loadFixture(deployFeeCollectorFixture);

            const { erc20, erc20Address } = await deployERC20MockFixture();

            const fee = 1000n;
            await erc20.transfer(feeCollectorAddress, fee);
            await feeCollector.collectErc20(erc20Address);

            expect(await erc20.balanceOf(feeCollectorAddress)).to.equal(fee);
        });

    });

    describe("Withdraw", function () {
        it ("should be able to withdraw fees", async function () {
            const { feeCollector } = await loadFixture(deployFeeCollectorFixture);

            const [_, alice] = await hre.ethers.getSigners();

            const fee = 1000n;
            await feeCollector.collect({value: fee});

            const aliceInitialBalance = await hre.ethers.provider.getBalance(alice);

            await feeCollector.withdraw(alice.address, fee);

            expect(await hre.ethers.provider.getBalance(feeCollector)).to.equal(0);
            expect(await hre.ethers.provider.getBalance(alice)).to.equal(aliceInitialBalance + fee)
        });

        it ("should be able to withdraw ERC20 fees", async function () {
            const { feeCollector, feeCollectorAddress } = await loadFixture(deployFeeCollectorFixture);

            const { erc20, erc20Address } = await deployERC20MockFixture();

            const [_, alice] = await hre.ethers.getSigners();

            const fee = 1000n;
            await erc20.transfer(feeCollectorAddress, fee);

            const aliceInitialBalance = await erc20.balanceOf(alice.address);
            await feeCollector.withdrawErc20(erc20Address, alice.address, fee);

            expect(await erc20.balanceOf(feeCollectorAddress)).to.equal(0);
            expect(await erc20.balanceOf(alice.address)).to.equal(aliceInitialBalance + fee);

        });

        it ("should not be able to withdraw fees if not admin", async function () {
        });
    });
});