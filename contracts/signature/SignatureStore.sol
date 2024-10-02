// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {BitMaps} from "@openzeppelin/contracts/utils/structs/BitMaps.sol";
import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/// @title Signature Store contract
/// @author d0x4545lit
/// @notice Contract to store signatures and verify them through EIP1271.
/// ************************
/// - WIP - WORK IN PROGRESS
/// ************************
/// @custom:security-contact dev@deelit.net
abstract contract SignatureStore is IERC1271, Initializable {
    bytes4 internal constant MAGICVALUE = 0x1626ba7e; // bytes4(keccak256("isValidSignature(bytes32,bytes)")

    /// @custom:storage-location erc7201:deelit.storage.FeeDispatcher
    struct SignatureStoreStorage {
        // BitMaps to store the signatures
        BitMaps.BitMap signatures;
    }

    // keccak256(abi.encode(uint256(keccak256("deelit.storage.SignatureStore")) - 1)) & ~bytes32(uint256(0xff));
    bytes32 private constant SignatureStoreStorageLocation = 0xcc7307c58ab5c6f002d0d69e0c8dec85800866b5fbd94a9e364a83bac8e0a000;

    function _getSignatureStoreStorage() private pure returns (SignatureStoreStorage storage $) {
        assembly {
            $.slot := SignatureStoreStorageLocation
        }
    }

    /**
     * @dev Initializes the contract connected to an initial authority.
     */
    function __SignatureStore_init() internal onlyInitializing {
        __SignatureStore_init_unchained();
    }

    function __SignatureStore_init_unchained() internal onlyInitializing {
        // nothing to do
    }

    function _getSignatures() private view returns (BitMaps.BitMap storage) {
        SignatureStoreStorage storage $ = _getSignatureStoreStorage();
        return $.signatures;
    }

    /// @notice Register a signature
    /// @param hash_ the hash to register
    function _registerSignature(bytes32 hash_) internal {
        BitMaps.set(_getSignatures(), uint256(hash_));
    }

    /// @notice Revoke a signature
    /// @param hash_ the hash to revoke
    function _revokeSignature(bytes32 hash_) internal {
        BitMaps.unset(_getSignatures(), uint256(hash_));
    }

    /// Check if the signature is valid
    /// @param hash_ the hash to check
    /// @param signature the signature to check
    function isValidSignature(bytes32 hash_, bytes memory signature) external view override returns (bytes4 magicValue) {
        signature; // explicitly ignore the signature
        return BitMaps.get(_getSignatures(), uint256(hash_)) ? MAGICVALUE : bytes4(0);
    }
}
