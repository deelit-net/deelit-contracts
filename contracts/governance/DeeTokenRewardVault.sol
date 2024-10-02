// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {AccessManaged} from "@openzeppelin/contracts/access/manager/AccessManaged.sol";
import {ERC4626, ERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";

/// @title Reward vault for the Deelit Protocol
/// @notice The reward vault is responsible for minting the reward tokens to the users.
/// The underlaying token (DeeToken) is fullfilled by the protocol FeeCollector.
/// ************************
/// - WIP - WORK IN PROGRESS
/// ************************
/// @author d0x4545lit
/// @custom:security-contact dev@deelit.net
contract DeeTokenRewardVault is ERC4626, AccessManaged {
    string private constant NAME = "DeeRewardToken";
    string private constant SYMBOL = "DEERT";

    event Rewarded(address indexed to, uint256 amount);

    constructor(address initialAuthority, IERC20 deeToken) ERC20(NAME, SYMBOL) ERC4626(deeToken) AccessManaged(initialAuthority) {}

    /// @notice Reward the user with the specified amount of tokens
    /// @dev The reward is minted to the user
    function reward(uint256 amount, address to) public restricted {
        require(amount > 0, "DeeRewardToken: amount must be greater than 0");
        _mint(to, amount);

        emit Rewarded(to, amount);
    }
}
