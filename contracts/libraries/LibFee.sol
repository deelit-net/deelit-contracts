// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {LibBp} from "./LibBp.sol";
import {IFeeCollector} from "../protocol/IFeeCollector.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

/// @custom:security-contact dev@deelit.net
library LibFee {
    using LibBp for uint;
    using Math for uint;

    struct Fee {
        IFeeCollector collector; // address of the account to receive the fee
        uint48 amount_bp; // percentage of the payment to be paid as fee by the payer (eg. 1000 = 10%)
    }

    /// @dev compute the fee to be paid by the payer
    /// @param amount_ the price of the product
    /// @param fee_  the fee to be applied
    function calculateFees(uint256 amount_, Fee memory fee_) internal pure returns (uint256) {
        require(fee_.amount_bp <= 10000, "fee is too big");
        return amount_.bp(fee_.amount_bp);
    }
}
