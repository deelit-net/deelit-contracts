// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

/// @custom:security-contact dev@deelit.net
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
