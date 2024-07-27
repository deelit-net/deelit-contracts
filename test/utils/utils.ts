import hre, { ethers } from "hardhat";
import {
  LibAcceptance,
  LibConflict,
  LibOffer,
  LibPayment,
  LibVerdict,
} from "../../typechain-types/contracts/DeelitProtocol";
import { PaymentBuilder } from "./builder/payment";
import { OfferBuilder } from "./builder/offer";
import {
  AcceptanceTypedData,
  ConflictTypedData,
  LotteryTypedData,
  OfferTypedData,
  PaymentTypedData,
  VerdictTypedData,
} from "./types";
import { AcceptanceBuilder } from "./builder/acceptance";
import { encodeBytes32String, ZeroAddress } from "ethers";
import { ConflictBuilder } from "./builder/conflict";
import { VerdictBuilder } from "./builder/verdict";
import { LibLottery } from "../../typechain-types/contracts/lottery/Lottery";

export const A_DAY = 24 * 60 * 60;
export const A_WEEK = 7 * A_DAY;
export const A_MONTH = 30 * A_DAY;

export const ZeroBytes32 = encodeBytes32String("");

export const MAGIC_VALUE = "0x1626ba7e";

export function domain(verifyingContract: string) {
  return {
    name: "deelit.net",
    version: "1",
    chainId: hre.network.config.chainId!,
    verifyingContract: verifyingContract,
  };
}

const DefaultPayment = new PaymentBuilder().get();
export const PaymentUtils = {
  builder: () => new PaymentBuilder(),
  new: (payment?: Partial<LibPayment.PaymentStruct>) => ({
    ...DefaultPayment,
    ...payment,
  }),
  hash: (payment: LibPayment.PaymentStruct, domainVerifyingContract: string) =>
    ethers.TypedDataEncoder.hash(
      domain(domainVerifyingContract),
      PaymentTypedData,
      payment
    ),
  typedData: PaymentTypedData,
};

const DefaultOffer = new OfferBuilder().get();
export const OfferUtils = {
  builder: () => new OfferBuilder(),
  new: (offer?: Partial<LibOffer.OfferStruct>) => ({
    ...DefaultOffer,
    ...offer,
  }),
  hash: (offer: LibOffer.OfferStruct, domainVerifyingContract: string) =>
    ethers.TypedDataEncoder.hash(
      domain(domainVerifyingContract),
      OfferTypedData,
      offer
    ),
  typedData: OfferTypedData,
};

const DefaultAcceptance = new AcceptanceBuilder().get();
export const AcceptanceUtils = {
  builder: () => new AcceptanceBuilder(),
  new: (acceptance?: Partial<LibAcceptance.AcceptanceStruct>) => ({
    ...DefaultAcceptance,
    ...acceptance,
  }),
  hash: (
    acceptance: LibAcceptance.AcceptanceStruct,
    domainVerifyingContract: string
  ) =>
    ethers.TypedDataEncoder.hash(
      domain(domainVerifyingContract),
      AcceptanceTypedData,
      acceptance
    ),
  typedData: AcceptanceTypedData,
};

export const DefaultConflict = new ConflictBuilder().get();
export const ConflictUtils = {
  builder: () => new ConflictBuilder(),
  new: (conflict?: Partial<LibConflict.ConflictStruct>) => ({
    ...DefaultConflict,
    ...conflict,
  }),
  hash: (
    conflict: LibConflict.ConflictStruct,
    domainVerifyingContract: string
  ) =>
    ethers.TypedDataEncoder.hash(
      domain(domainVerifyingContract),
      ConflictTypedData,
      conflict
    ),
  typedData: ConflictTypedData,
};

export const DefaultVerdict = {
  from_address: ZeroAddress,
  payment_hash: ZeroBytes32,
  payer_bp: 0,
  payee_bp: 0,
};
export const VerdictUtils = {
  builder: () => new VerdictBuilder(),
  hash: async (
    verdict: LibVerdict.VerdictStruct,
    domainVerifyingContract: string
  ) =>
    ethers.TypedDataEncoder.hash(
      domain(domainVerifyingContract),
      VerdictTypedData,
      verdict
    ),
  typedData: VerdictTypedData,
};

export const LotteryUtils = {
  hash : (lottery: LibLottery.LotteryStruct) => 
    ethers.TypedDataEncoder.hashStruct("Lottery", LotteryTypedData, lottery),
}

export function calculateFee(amount: bigint, fee: bigint): bigint {
  return (amount * fee) / 10000n;
}
