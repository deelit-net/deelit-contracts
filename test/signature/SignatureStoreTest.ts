import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre, { upgrades } from "hardhat";
import { ZeroBytes32 } from "../utils/utils";
import { BaseContract } from "ethers";
import { SignatureStoreMock } from "../../typechain-types";

describe("SignatureStoreMock", function () {
  async function deploySignatureStoreMockFixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const factory = await hre.ethers.getContractFactory("SignatureStoreMock");
    const signatureStoreMock = (await upgrades.deployProxy(factory, [owner.address])) as BaseContract as SignatureStoreMock;

    const magicValue =  await signatureStoreMock.magicValue();
    const zeroValue = '0x00000000';

    return { signatureStoreMock, owner, otherAccount, magicValue, zeroValue };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { signatureStoreMock, owner } = await loadFixture(deploySignatureStoreMockFixture);
      expect(await signatureStoreMock.owner()).to.equal(owner.address);
    });
  });

  describe("Signature Management", function () {
    it("Should register and check a signature", async function () {
      const { signatureStoreMock, magicValue } = await loadFixture(deploySignatureStoreMockFixture);
      const hash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("test"));
      
      await signatureStoreMock.registerSignature(hash);
      expect(await signatureStoreMock.isValidSignature(hash, ZeroBytes32)).to.be.eq(magicValue);
    });

    it("Should revoke a signature", async function () {
      const { signatureStoreMock, zeroValue } = await loadFixture(deploySignatureStoreMockFixture);
      const hash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("test"));
      
      await signatureStoreMock.registerSignature(hash);
      await signatureStoreMock.revokeSignature(hash);
      expect(await signatureStoreMock.isValidSignature(hash, ZeroBytes32)).to.be.eq(zeroValue);
    });

    it("Should allow to register multiple signatures", async function () {
        const { signatureStoreMock, magicValue } = await loadFixture(deploySignatureStoreMockFixture);
        const hash1 = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("test1"));
        const hash2 = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("test2"));
        
        await signatureStoreMock.registerSignature(hash1);
        await signatureStoreMock.registerSignature(hash2);
        expect(await signatureStoreMock.isValidSignature(hash1, ZeroBytes32)).to.be.eq(magicValue);
        expect(await signatureStoreMock.isValidSignature(hash2, ZeroBytes32)).to.be.eq(magicValue);
    });

    it ("Should allow to revoke multiple signatures", async function () {
        const { signatureStoreMock, magicValue, zeroValue } = await loadFixture(deploySignatureStoreMockFixture);
        const hash1 = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("test1"));
        const hash2 = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("test2"));
        const hash3 = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("test3"));
        const hash4 = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("test4"));

        await signatureStoreMock.registerSignature(hash1);
        await signatureStoreMock.registerSignature(hash2);
        await signatureStoreMock.registerSignature(hash3);
        await signatureStoreMock.registerSignature(hash4);

        await signatureStoreMock.revokeSignature(hash2);
        await signatureStoreMock.revokeSignature(hash4);

        expect(await signatureStoreMock.isValidSignature(hash1, ZeroBytes32)).to.be.eq(magicValue);
        expect(await signatureStoreMock.isValidSignature(hash2, ZeroBytes32)).to.be.eq(zeroValue);
        expect(await signatureStoreMock.isValidSignature(hash3, ZeroBytes32)).to.be.eq(magicValue);
        expect(await signatureStoreMock.isValidSignature(hash4, ZeroBytes32)).to.be.eq(zeroValue);
    });

    it("Should return zero value for non-existent signatures", async function () {
        const { signatureStoreMock, zeroValue } = await loadFixture(deploySignatureStoreMockFixture);
        const hash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("nonexistent"));
        
        expect(await signatureStoreMock.isValidSignature(hash, ZeroBytes32)).to.be.eq(zeroValue);
      });

      it("Should handle revoking a non-existent signature", async function () {
        const { signatureStoreMock, zeroValue } = await loadFixture(deploySignatureStoreMockFixture);
        const hash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("nonexistent"));
        
        await signatureStoreMock.revokeSignature(hash);
        expect(await signatureStoreMock.isValidSignature(hash, ZeroBytes32)).to.be.eq(zeroValue);
      });
      
      it("Should handle registering the same signature twice", async function () {
        const { signatureStoreMock, magicValue } = await loadFixture(deploySignatureStoreMockFixture);
        const hash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("test"));
        
        await signatureStoreMock.registerSignature(hash);
        await signatureStoreMock.registerSignature(hash);

        expect(await signatureStoreMock.isValidSignature(hash, ZeroBytes32)).to.be.eq(magicValue);
      });
  });
});