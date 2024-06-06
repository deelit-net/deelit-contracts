// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "../../libraries/LibBp.sol";

contract LibBpMock {
    using LibBp for uint;

    function bp(uint256 value, uint256 bpValue) external pure returns (uint256) {
        return value.bp(bpValue);
    }
}
