// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessManagedUpgradeable} from "@openzeppelin/contracts-upgradeable/access/manager/AccessManagedUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IFeeRecipient} from "./interfaces/IFeeRecipient.sol";


/// @title The Deelit Protocol Fee Recipient contract
/// @author d0x4545lit
/// @notice This is a basic fee collector contract that only collect native and ERC20 fees and allow the owner to withdraw them.
/// @custom:security-contact dev@deelit.net
contract FeeRecipient is IFeeRecipient, AccessManagedUpgradeable, PausableUpgradeable, UUPSUpgradeable {
    using Address for address payable;
    using SafeERC20 for IERC20;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address manager_) public initializer {
        __AccessManaged_init(manager_);
        __Pausable_init();
        __UUPSUpgradeable_init();
    }

    receive() external payable {
        // nothing to do
    }

    function withdraw(address payable receiver_, uint256 amount_) external restricted {
        require(amount_ <= address(this).balance, "FeeCollector: insufficient balance");
        receiver_.sendValue(amount_);
    }

    function withdrawErc20(address token_, address receiver_, uint256 amount_) external restricted {
        IERC20(token_).safeTransfer(receiver_, amount_);
    }

    /// @dev Authorize an upgrade of the protocol. Only the admin can authorize an upgrade.
    function _authorizeUpgrade(address newImplementation) internal override restricted {}
}
