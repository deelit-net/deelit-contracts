import { AddressLike, BigNumberish, BytesLike } from "ethers";
import { LibOffer } from "../../../typechain-types/contracts/DeelitProtocol";

export class OfferBuilder {
    private offer: LibOffer.OfferStruct;
  
    constructor() {
      this.offer = {
        from_address: "0x0000000000000000000000000000000000000000",
        product_hash:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        chain_id: 1,
        currency_code: "",
        token_address: "0x0000000000000000000000000000000000000000",
        price: 0,
        shipment_price: 0,
        shipment_type: 0,
        expiration_time: 0,
      };
    }
  
    withFromAddress(from_address: AddressLike): OfferBuilder {
      this.offer.from_address = from_address;
      return this;
    }
  
    withProductHash(product_hash: BytesLike): OfferBuilder {
      this.offer.product_hash = product_hash;
      return this;
    }
  
    withChainId(chain_id: BigNumberish): OfferBuilder {
      this.offer.chain_id = chain_id;
      return this;
    }
  
    withCurrencyCode(currency_code: string): OfferBuilder {
      this.offer.currency_code = currency_code;
      return this;
    }
  
    withTokenAddress(token_address: AddressLike): OfferBuilder {
      this.offer.token_address = token_address;
      return this;
    }
  
    withPrice(price: BigNumberish): OfferBuilder {
      this.offer.price = price;
      return this;
    }
  
    withShipmentPrice(shipment_price: BigNumberish): OfferBuilder {
      this.offer.shipment_price = shipment_price;
      return this;
    }
  
    withShipmentType(shipment_type: BigNumberish): OfferBuilder {
      this.offer.shipment_type = shipment_type;
      return this;
    }
  
    withExpirationTime(expiration_time: BigNumberish): OfferBuilder {
      this.offer.expiration_time = expiration_time;
      return this;
    }
  
    get(): LibOffer.OfferStruct {
      return this.offer;
    }
    
  }