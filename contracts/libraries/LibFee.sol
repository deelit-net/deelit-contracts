// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {LibBp} from "./LibBp.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

/// @custom:security-contact dev@deelit.net
library LibFee {
    using LibBp for uint;
    using Math for uint;

    bytes32 private constant FEE_TYPEHASH = keccak256("Fee(address recipient,uint48 amount_bp)");

    struct Fee {
        address recipient; // address of the fee recipient
        uint48 amount_bp; // percentage of the payment to be paid as fee by the payer (eg. 1000 = 10%)
    }

    /// @dev compute the fee to be paid by the payer
    /// @param amount the price of the product
    /// @param feeBp  the fee percentage
    function calculateFee(uint256 amount, uint48 feeBp) internal pure returns (uint256) {
        require(feeBp <= 10000, "fee is too big");
        return amount.bp(feeBp);
    }

    function hash(Fee memory fee) internal pure returns (bytes32) {
        return keccak256(abi.encode(FEE_TYPEHASH, fee.recipient, fee.amount_bp));
    }

    function equal(Fee memory fee1, Fee memory fee2) internal pure returns (bool) {
        return fee1.recipient == fee2.recipient && fee1.amount_bp == fee2.amount_bp;
    }
}
