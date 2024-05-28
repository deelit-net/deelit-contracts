import { AddressLike, BigNumberish, BytesLike } from "ethers";
import { LibVerdict } from "../../../typechain-types/contracts/DeelitProtocol";


export class VerdictBuilder {
  private verdict: LibVerdict.VerdictStruct;

  constructor() {
    this.verdict = {
      from_address: "0x0000000000000000000000000000000000000000",
      payment_hash:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      payer_bp: 0,
      payee_bp: 0,
    };
  }

  withFromAddress(from_address: AddressLike): VerdictBuilder {
    this.verdict.from_address = from_address;
    return this;
  }

  withPaymentHash(payment_hash: BytesLike): VerdictBuilder {
    this.verdict.payment_hash = payment_hash;
    return this;
  }

  withPayerBp(payer_bp: BigNumberish): VerdictBuilder {
    this.verdict.payer_bp = payer_bp;
    return this;
  }

  withPayeeBp(payee_bp: BigNumberish): VerdictBuilder {
    this.verdict.payee_bp = payee_bp;
    return this;
  }

  get(): LibVerdict.VerdictStruct {
    return this.verdict;
  }
}
