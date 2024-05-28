// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/math/Math.sol";

/// @title BpLibrary
/// @dev Library for handling base points operations.
library LibBp {
    using Math for uint;

    /// @dev calculate basis point from value with bpValue. (bp = value * bpValue / 100_00)
    /// @param value the value input
    /// @param bpValue  the bp input (100_00 = 100%)
    function bp(uint value, uint bpValue) internal pure returns (uint) {
        return value.mulDiv(bpValue, 10000);
    }
}
