import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { AcceptanceUtils, OfferUtils, PaymentUtils } from "../utils/utils";
import { deployDeelitProtocolFixture } from "../utils/fixtures";
import { ZeroAddress } from "ethers";
import { LibTransaction } from "../../typechain-types/contracts/lottery/Lottery";

describe("DeelitProtocol - Pause tests", function () {
  it("should admin pause the contract", async function () {
    const { accessManager, PAUSER_ROLE, deelit, owner } = await loadFixture(deployDeelitProtocolFixture);

    // grand owner to pauser role
    await accessManager.grantRole(PAUSER_ROLE, owner.address, 0);

    await deelit.pause();

    expect(await deelit.paused()).to.equal(true);
  });

  it("should admin unpause the contract", async function () {
    const { accessManager, PAUSER_ROLE, deelit, owner } = await loadFixture(deployDeelitProtocolFixture);

    // grand owner to pauser role
    await accessManager.grantRole(PAUSER_ROLE, owner.address, 0);

    await deelit.pause();
    await deelit.unpause();

    expect(await deelit.paused()).to.equal(false);
  });

  it("should not allow non-admin to pause the contract", async function () {
    const { accessManager, PAUSER_ROLE, deelit, owner, alice } = await loadFixture(deployDeelitProtocolFixture);

    // grand owner to pauser role
    await accessManager.grantRole(PAUSER_ROLE, owner.address, 0);

    await expect(deelit.connect(alice).pause()).to.be.revertedWithCustomError(
      deelit,
      "AccessManagedUnauthorized"
    );
  });

  it("should not allow non-admin to unpause the contract", async function () {
    const { accessManager, PAUSER_ROLE,deelit, owner, alice } = await loadFixture(deployDeelitProtocolFixture);

    // grand owner to pauser role
    await accessManager.grantRole(PAUSER_ROLE, owner.address, 0);

    await deelit.pause();
    await expect(deelit.connect(alice).unpause()).to.be.revertedWithCustomError(
      deelit,
      "AccessManagedUnauthorized"
    );
  });

  it("should not be able to pay when paused", async function () {
    const { accessManager, PAUSER_ROLE,deelit, owner } = await loadFixture(deployDeelitProtocolFixture);

    // grand owner to pauser role
    await accessManager.grantRole(PAUSER_ROLE, owner.address, 0);

    await deelit.pause();

    const tx: LibTransaction.TransactionStruct = {
      payment: PaymentUtils.builder().get(),
      offer: OfferUtils.builder().get(),
    };

    await expect(deelit.pay(tx, "0x01", ZeroAddress)).to.be.revertedWithCustomError(
      deelit,
      "EnforcedPause"
    );
  });

  it("should not be able to claim with acceptance when paused", async function () {
    const { accessManager, PAUSER_ROLE, deelit, owner } = await loadFixture(deployDeelitProtocolFixture);

    // grand owner to pauser role
    await accessManager.grantRole(PAUSER_ROLE, owner.address, 0);

    await deelit.pause();

    const tx: LibTransaction.TransactionStruct = {
      payment: PaymentUtils.builder().get(),
      offer: OfferUtils.builder().get(),
    };

    const acceptance = AcceptanceUtils.builder().get();

    await expect(
      deelit.claimAccepted(tx, acceptance, "0x01")
    ).to.be.revertedWithCustomError(deelit, "EnforcedPause");
  });

  it("should not be able to claim when paused", async function () {
    const { accessManager, PAUSER_ROLE, deelit, owner } = await loadFixture(deployDeelitProtocolFixture);

    // grand owner to pauser role
    await accessManager.grantRole(PAUSER_ROLE, owner.address, 0);

    await deelit.pause();

    const tx: LibTransaction.TransactionStruct = {
      payment: PaymentUtils.builder().get(),
      offer: OfferUtils.builder().get(),
    };

    await expect(deelit.claim(tx)).to.be.revertedWithCustomError(
      deelit,
      "EnforcedPause"
    );
  });
});
