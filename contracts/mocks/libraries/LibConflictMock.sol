// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "../../libraries/LibConflict.sol";

contract LibConflictMock {
    function hash(LibConflict.Conflict calldata conflict_) external pure returns (bytes32) {
        return LibConflict.hash(conflict_);
    }
}
