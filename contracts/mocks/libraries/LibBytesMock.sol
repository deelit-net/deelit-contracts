// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "../../libraries/LibBytes.sol";

contract LibBytesMock {
    using LibBytes for bytes;

    function toAddress(bytes memory bytes_) external pure returns (address addr) {
        return bytes_.toAddress();
    }
}
