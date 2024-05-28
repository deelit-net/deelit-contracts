import { AddressLike, BigNumberish, BytesLike } from "ethers";
import { LibPayment } from "../../../typechain-types/contracts/DeelitProtocol";
import { PaymentUtils } from "../utils";

export class PaymentBuilder {
    private payment: LibPayment.PaymentStruct;
  
    constructor() {
      this.payment = {
        from_address: "0x0000000000000000000000000000000000000000",
        destination_address: "0x0000000000000000000000000000000000000000",
        offer_hash:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        vesting_period: 0,
        expiration_time: 0,
      };
    }
  
    withFromAddress(from_address: AddressLike): PaymentBuilder {
      this.payment.from_address = from_address;
      return this;
    }
  
    withDestinationAddress(destination_address: BytesLike): PaymentBuilder {
      this.payment.destination_address = destination_address;
      return this;
    }
  
    withOfferHash(offer_hash: BytesLike): PaymentBuilder {
      this.payment.offer_hash = offer_hash;
      return this;
    }
  
    withVestingPeriod(vesting_period: BigNumberish): PaymentBuilder {
      this.payment.vesting_period = vesting_period;
      return this;
    }
  
    withExpirationTime(expiration_time: BigNumberish): PaymentBuilder {
      this.payment.expiration_time = expiration_time;
      return this;
    }
  
    get(): LibPayment.PaymentStruct {
      return this.payment;
    }
    
  }
  