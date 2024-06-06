// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "@openzeppelin/contracts/utils/math/Math.sol";

/// @title BpLibrary
/// @dev Library for handling base points operations.
/// @custom:security-contact dev@deelit.net
library LibBp {
    using Math for uint;

    /// @dev calculate basis point from value with bpValue. (bp = value * bpValue / 100_00)
    /// @param value the value input
    /// @param bpValue  the bp input (100_00 = 100%)
    function bp(uint256 value, uint256 bpValue) internal pure returns (uint256) {
        return value.mulDiv(bpValue, 10000);
    }
}
