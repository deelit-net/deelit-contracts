// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../libraries/LibAcceptance.sol";

contract LibAcceptanceMock {
    function hash(LibAcceptance.Acceptance calldata Acceptance_) external pure returns (bytes32) {
        return LibAcceptance.hash(Acceptance_);
    }
}
