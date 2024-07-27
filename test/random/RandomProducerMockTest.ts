import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { deployRandomProducerMockFixture } from "../utils/fixtures";

describe("RandomProducerMock", function () {
  describe("Deployment", function () {
    it("Should set the right initial values", async function () {
      const { randomProducerMock } = await loadFixture(
        deployRandomProducerMockFixture,
      );

      expect(await randomProducerMock.releaseDelay()).to.equal(0);
      expect(await randomProducerMock.requestCounter()).to.equal(0);
    });
  });

  describe("setReleaseDelay", function () {
    it("Should set the release delay", async function () {
      const { randomProducerMock } = await loadFixture(
        deployRandomProducerMockFixture,
      );

      await randomProducerMock.setReleaseDelay(100);
      expect(await randomProducerMock.releaseDelay()).to.equal(100);
    });
  });

  describe("setRandomWord", function () {
    it("Should set the random word for a given request ID", async function () {
      const { randomProducerMock, randomRequestPrice } = await loadFixture(
        deployRandomProducerMockFixture,
      );

      await randomProducerMock.requestRandomWord({value: randomRequestPrice});
      await randomProducerMock.setRandomWord(1, 123456);
      expect(await randomProducerMock.getRequestStatus(1)).to.deep.eq([
        randomRequestPrice,
        true,
        123456,
      ]);
    });
  });

  describe("requestRandomWord", function () {
    it("Should be able to request a random number", async function () {
      const { randomProducerMock, randomRequestPrice } = await loadFixture(
        deployRandomProducerMockFixture,
      );

      await randomProducerMock.requestRandomWord({value: randomRequestPrice});
      expect(await randomProducerMock.requestCounter()).to.equal(1);

      await randomProducerMock.setRandomWord(1, 123456);
      const status = await randomProducerMock.getRequestStatus(1);
      expect(status[0]).to.equal(100000000000000000n);
      expect(status[1]).to.be.true;
      expect(status[2]).to.equal(123456n);
    });
  });
});
