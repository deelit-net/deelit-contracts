// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library LibAcceptance {
    bytes32 constant ACCEPTANCE_TYPEHASH = keccak256("Acceptance(address from_address,bytes32 payment_hash)");

    struct Acceptance {
        address from_address; // address of the judge
        bytes32 payment_hash; // hash of accepted the payment
    }

    function hash(Acceptance calldata acceptance_) internal pure returns (bytes32) {
        return keccak256(abi.encode(ACCEPTANCE_TYPEHASH, acceptance_.from_address, acceptance_.payment_hash));
    }
}
