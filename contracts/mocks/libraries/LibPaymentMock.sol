// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../libraries/LibPayment.sol";

contract LibPaymentMock {
    function hash(LibPayment.Payment calldata payment_) external pure returns (bytes32) {
        return LibPayment.hash(payment_);
    }
}
