// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../libraries/LibBp.sol";

contract LibBpMock {
    using LibBp for uint;

    function bp(uint value, uint bpValue) external pure returns (uint) {
        return value.bp(bpValue);
    }
}
