// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

library LibBytes {
    /// @dev Convert bytes to address
    /// @param bytes_ bytes wuth must be 20 bytes
    /// @return addr the address
    function toAddress(bytes memory bytes_) internal pure returns (address addr) {
        require(bytes_.length == 20, "LibBytes: toAddress - Invalid address length");
        assembly {
            addr := mload(add(bytes_, 20))
        }
    }
}
