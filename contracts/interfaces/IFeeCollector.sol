// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/IAccessControl.sol";
import "../libraries/LibTransaction.sol";
import "../libraries/LibConflict.sol";
import "../libraries/LibVerdict.sol";
import "../libraries/LibAcceptance.sol";

/// @title Fee Collector Interface
/// @author d0x4545lit
/// @notice Interface for the Fee Collector.
/// @dev This interface define the main functions of the Fee Collector.
interface IFeeCollector {
    /// @dev Handle native fees.
    function collect() external payable;

    /// @dev Handle ERC20 tokens.
    function collectErc20(address token_) external;
}
