// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../libraries/LibFee.sol";

contract LibFeeMock {
    function calculateFees(uint256 amount_, LibFee.Fee memory fee_) external pure returns (uint256) {
        return LibFee.calculateFees(amount_, fee_);
    }
}
