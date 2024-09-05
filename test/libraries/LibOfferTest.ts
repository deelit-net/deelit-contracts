import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { LibOfferMock } from "../../typechain-types";
import { LibOffer } from "../../typechain-types/contracts/DeelitProtocol";

describe("LibOffer", function () {
  let lib: LibOfferMock;

  before(async () => {
    lib = await hre.ethers.deployContract("LibOfferMock");
  });

  describe("should hash struct offer", () => {
    it("should hash struct offer", async () => {
      const types = {
        Offer: [
          { name: "from_address", type: "address" },
          { name: "product_hash", type: "bytes32" },
          { name: "price", type: "uint256" },
          { name: "currency_code", type: "string" },
          { name: "chain_id", type: "uint256" },
          { name: "token_address", type: "address" },
          { name: "shipment_hash", type: "bytes32" },
          { name: "shipment_price", type: "uint256" },
          { name: "expiration_time", type: "uint256" },
          { name: "salt", type: "uint256" },
        ],
      };

      const offer: LibOffer.OfferStruct = {
        from_address: "0x0000000000000000000000000000000000000001",
        product_hash: ethers.encodeBytes32String("1"),
        price: 100,
        currency_code: "USDT",
        chain_id: 1,
        token_address: "0x0000000000000000000000000000000000000002",
        shipment_hash: ethers.encodeBytes32String("1"),
        shipment_price: 10,
        expiration_time: 100,
        salt: 1,
      };

      const hash = await lib.hash(offer);
      const ethersHash = ethers.TypedDataEncoder.hashStruct(
        "Offer",
        types,
        offer,
      );

      expect(hash).to.equal(ethersHash);
    });
  });
});
