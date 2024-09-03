// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {LibBp} from "./LibBp.sol";

/// @custom:security-contact dev@deelit.net
library LibVerdict {
    using LibBp for uint256;

    bytes32 private constant VERDICT_TYPEHASH = keccak256("Verdict(address from_address,bytes32 conflict_hash,bool granted)");

    struct Verdict {
        address from_address; // address of the verdict issuer
        bytes32 conflict_hash; // hash of the conflict
        bool granted; // true if the verdict is granted
    }

    function hash(Verdict memory verdict_) internal pure returns (bytes32) {
        return keccak256(abi.encode(VERDICT_TYPEHASH, verdict_.from_address, verdict_.conflict_hash, verdict_.granted));
    }
}
