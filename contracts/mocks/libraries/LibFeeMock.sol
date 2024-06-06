// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "../../libraries/LibFee.sol";

contract LibFeeMock {
    function calculateFees(uint256 amount_, LibFee.Fee memory fee_) external pure returns (uint256) {
        return LibFee.calculateFees(amount_, fee_);
    }
}
