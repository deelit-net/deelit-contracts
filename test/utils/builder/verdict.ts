import { AddressLike, BigNumberish, BytesLike } from "ethers";
import { LibVerdict } from "../../../typechain-types/contracts/DeelitProtocol";

export class VerdictBuilder {
  private verdict: LibVerdict.VerdictStruct;

  constructor() {
    this.verdict = {
      from_address: "0x0000000000000000000000000000000000000000",
      conflict_hash:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      granted: false,
    };
  }

  withFromAddress(from_address: AddressLike): VerdictBuilder {
    this.verdict.from_address = from_address;
    return this;
  }

  withConflictHash(conflict_hash: BytesLike): VerdictBuilder {
    this.verdict.conflict_hash = conflict_hash;
    return this;
  }

  withGranted(granted: boolean): VerdictBuilder {
    this.verdict.granted = granted;
    return this;
  }

  get(): LibVerdict.VerdictStruct {
    return this.verdict;
  }
}
