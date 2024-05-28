import { AddressLike, BytesLike } from "ethers";
import { LibAcceptance } from "../../../typechain-types/contracts/DeelitProtocol";

export class AcceptanceBuilder {
  private acceptance: LibAcceptance.AcceptanceStruct;

  constructor() {
    this.acceptance = {
      from_address: "0x0000000000000000000000000000000000000000",
      payment_hash:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
    };
  }

  withFromAddress(from_address: AddressLike): AcceptanceBuilder {
    this.acceptance.from_address = from_address;
    return this;
  }

  withPaymentHash(payment_hash: BytesLike): AcceptanceBuilder {
    this.acceptance.payment_hash = payment_hash;
    return this;
  }

  get(): LibAcceptance.AcceptanceStruct {
    return this.acceptance;
  }
}
