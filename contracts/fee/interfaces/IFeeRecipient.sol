// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;


/// @title Fee Recipient Interface
/// @author d0x4545lit
/// @notice Interface for the Fee Recipient.
/// @dev This interface define the main functions of the Fee Recipient.
/// @custom:security-contact dev@deelit.net
interface IFeeRecipient {

    /// @dev Withdraw native fees to the specified address.
    function withdraw(address payable receiver_, uint256 amount_) external;

    /// @dev Withdraw ERC20 tokens to the specified address.
    function withdrawErc20(address token_, address receiver_, uint256 amount_) external;
}
