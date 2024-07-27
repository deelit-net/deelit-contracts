// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "../../libraries/LibFee.sol";

contract LibFeeMock {
    function calculateFees(uint256 amount, uint48 feeBp) external pure returns (uint256) {
        return LibFee.calculateFee(amount, feeBp);
    }

    function hash(LibFee.Fee memory fee) external pure returns (bytes32) {
        return LibFee.hash(fee);
    }
}
