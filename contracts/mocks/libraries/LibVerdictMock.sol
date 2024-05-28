// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../libraries/LibVerdict.sol";

contract LibVerdictMock {
    function hash(LibVerdict.Verdict calldata verdict_) external pure returns (bytes32) {
        return LibVerdict.hash(verdict_);
    }
}
