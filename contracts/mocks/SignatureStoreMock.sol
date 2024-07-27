// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {SignatureStore} from "../signature/SignatureStore.sol";

/// @title SignatureStoreMock contract
/// @notice Mock contract for testing SignatureStore
contract SignatureStoreMock is SignatureStore, OwnableUpgradeable, UUPSUpgradeable {

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
        __SignatureStore_init();
        __UUPSUpgradeable_init();
    }

    function registerSignature(bytes32 hash_) external {
        _registerSignature(hash_);
    }

    function revokeSignature(bytes32 hash_) external {
        _revokeSignature(hash_);
    }

    function magicValue() external pure returns (bytes4) {
        return MAGICVALUE;
    }

    function _authorizeUpgrade(address newImplementation) internal virtual override onlyOwner {}

}
