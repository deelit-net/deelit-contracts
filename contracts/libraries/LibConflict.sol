// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// @custom:security-contact dev@deelit.net
library LibConflict {
    bytes32 private constant CONFLICT_TYPEHASH = keccak256("Conflict(address from_address,bytes32 payment_hash)");

    struct Conflict {
        address from_address; // address of the conflict initiator
        bytes32 payment_hash; // hash of the payment
    }

    function hash(Conflict calldata conflict_) internal pure returns (bytes32) {
        return keccak256(abi.encode(CONFLICT_TYPEHASH, conflict_.from_address, conflict_.payment_hash));
    }
}
