// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { LibAcceptance } from "../../libraries/LibAcceptance.sol";

contract LibAcceptanceMock {
    function hash(LibAcceptance.Acceptance calldata Acceptance_) external pure returns (bytes32) {
        return LibAcceptance.hash(Acceptance_);
    }
}
