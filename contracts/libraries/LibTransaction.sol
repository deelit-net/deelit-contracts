// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./LibPayment.sol";
import "./LibOffer.sol";

/// @custom:security-contact dev@deelit.net
library LibTransaction {
    struct Transaction {
        LibPayment.Payment payment;
        LibOffer.Offer offer;
    }
}
