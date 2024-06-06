// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;


/// @title Fee Collector Interface
/// @author d0x4545lit
/// @notice Interface for the Fee Collector.
/// @dev This interface define the main functions of the Fee Collector.
/// @custom:security-contact dev@deelit.net
interface IFeeCollector {
    /// @dev Handle native fees.
    function collect() external payable;

    /// @dev Handle ERC20 tokens.
    function collectErc20(address token_) external;
}
