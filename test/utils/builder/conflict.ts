import { AddressLike, BytesLike } from "ethers";
import { LibConflict } from "../../../typechain-types/contracts/DeelitProtocol";

export class ConflictBuilder {
  private conflict: LibConflict.ConflictStruct;

  constructor() {
    this.conflict = {
      from_address: "0x0000000000000000000000000000000000000000",
      payment_hash:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
    };
  }

  withFromAddress(from_address: AddressLike): ConflictBuilder {
    this.conflict.from_address = from_address;
    return this;
  }

  withPaymentHash(payment_hash: BytesLike): ConflictBuilder {
    this.conflict.payment_hash = payment_hash;
    return this;
  }

  get(): LibConflict.ConflictStruct {
    return this.conflict;
  }
}
