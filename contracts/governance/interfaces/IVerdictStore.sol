// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {LibVerdict} from "../../libraries/LibVerdict.sol";

/// @title Verdict store interface
/// @author d0x4545lit
/// @notice The interface for the verdict store contract. The verdict store is responsible for storing the verdicts of the conflicts resolved by the DeeAO.
/// ************************
/// - WIP - WORK IN PROGRESS
/// ************************
interface IVerdictStore is IERC1271 {
    event VerdictStored(bytes32 indexed verdictHash);

    function storeVerdict(LibVerdict.Verdict memory verdict_) external;
}
