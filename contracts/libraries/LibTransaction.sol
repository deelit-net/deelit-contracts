// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {LibPayment} from "./LibPayment.sol";
import {LibOffer} from "./LibOffer.sol";

library LibTransaction {
    struct Transaction {
        LibPayment.Payment payment;
        LibOffer.Offer offer;
    }
}
