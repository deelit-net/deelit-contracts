// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../libraries/LibConflict.sol";

contract LibConflictMock {
    function hash(LibConflict.Conflict calldata conflict_) external pure returns (bytes32) {
        return LibConflict.hash(conflict_);
    }
}
