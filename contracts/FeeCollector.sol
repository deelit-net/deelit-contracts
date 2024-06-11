// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./interfaces/IFeeCollector.sol";


/// @title The Deelit Protocol Fee Collector contract
/// @author d0x4545lit
/// @notice This is a basic fee collector contract that only collect native and ERC20 fees and allow the owner to withdraw them.
/// @custom:security-contact dev@deelit.net
contract FeeCollector is IFeeCollector, AccessControlUpgradeable, PausableUpgradeable, UUPSUpgradeable {
    using Address for address payable;
    using SafeERC20 for IERC20;

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER");

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __AccessControl_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        // set roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function collect() external payable whenNotPaused {
        // nothing to do
    }

    function collectErc20(address token_) external whenNotPaused {
        // nothing to do
    }

    function withdraw(address payable receiver_, uint256 amount_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(amount_ <= address(this).balance, "FeeCollector: insufficient balance");
        receiver_.sendValue(amount_);
    }

    function withdrawErc20(address token_, address receiver_, uint256 amount_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20(token_).safeTransfer(receiver_, amount_);
    }

    /// @dev Pause the fee collector.
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /// @dev Unpause the fee collector.
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /// @dev Authorize an upgrade of the protocol. Only the admin can authorize an upgrade.
    function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(DEFAULT_ADMIN_ROLE)
        override
    {}
}