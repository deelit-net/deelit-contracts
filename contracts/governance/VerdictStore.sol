// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {AccessManagedUpgradeable, IAccessManager} from "@openzeppelin/contracts-upgradeable/access/manager/AccessManagedUpgradeable.sol";
import {IGovernor} from "@openzeppelin/contracts/governance/IGovernor.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {IVerdictStore, LibVerdict} from "./interfaces/IVerdictStore.sol";
import {IDeelitProtocol} from "../protocol/interfaces/IDeelitProtocol.sol";
import {LibEIP712} from "../libraries/LibEIP712.sol";
import {SignatureStore} from "../signature/SignatureStore.sol";

/// @title Verdict Store contract
/// @author d0x4545lit
/// @notice Verdict store contract to store verdicts from DeeAO and verify them through EIP1271.
/// ************************
/// - WIP - WORK IN PROGRESS
/// ************************
/// @custom:security-contact dev@deelit.net
contract VerdictStore is IVerdictStore, SignatureStore, AccessManagedUpgradeable, UUPSUpgradeable {
    /// @custom:storage-location erc7201:deelit.storage.VerdictStore
    struct VerdictStoreStorage {
        IGovernor governor; // The DeeAO contract
        IDeelitProtocol protocol; // The Deelit protocol contract
        bytes32 protocolDomainSeparator; // The EIP712 domain separator of the protocol
    }

    // keccak256(abi.encode(uint256(keccak256("deelit.storage.VerdictStore")) - 1)) & ~bytes32(uint256(0xff));
    bytes32 private constant VerdictStoreStorageLocation = 0x86b725e7392276045504af1b8370ac9435c01237208217558847ed21b40f7300;

    function _getVerdictStoreStorage() private pure returns (VerdictStoreStorage storage $) {
        assembly {
            $.slot := VerdictStoreStorageLocation
        }
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(IAccessManager manager_, IGovernor governor_, IDeelitProtocol protocol_) public initializer {
        __AccessManaged_init(address(manager_));
        __SignatureStore_init();

        _setGovernor(governor_);
        _setProtocol(protocol_);
    }

    function getGovernor() external view returns (IGovernor) {
        return _getGovernor();
    }

    function _getGovernor() private view returns (IGovernor) {
        VerdictStoreStorage storage $ = _getVerdictStoreStorage();
        return $.governor;
    }

    function setGovernor(IGovernor governor_) external restricted {
        _setGovernor(governor_);
    }

    function _setGovernor(IGovernor governor_) internal {
        require(address(governor_) != address(0), "LotteryVault: governor address is zero");
        VerdictStoreStorage storage $ = _getVerdictStoreStorage();
        $.governor = governor_;
    }

    function getProtocol() external view returns (IDeelitProtocol) {
        return _getProtocol();
    }

    function _getProtocol() private view returns (IDeelitProtocol) {
        VerdictStoreStorage storage $ = _getVerdictStoreStorage();
        return $.protocol;
    }

    function setProtocol(IDeelitProtocol protocol) external restricted {
        _setProtocol(protocol);
    }

    function _setProtocol(IDeelitProtocol protocol) internal {
        require(address(protocol) != address(0), "LotteryVault: protocol address is zero");
        (, string memory name, string memory version, uint256 chainId, address verifyingContract, , ) = protocol.eip712Domain();

        VerdictStoreStorage storage $ = _getVerdictStoreStorage();
        $.protocol = protocol;
        $.protocolDomainSeparator = LibEIP712.buildDomainSeparator(LibEIP712.EIP712Domain(name, version, chainId, verifyingContract));
    }

    function getProtocolDomainSeparator() external view returns (bytes32) {
        return _getProtocolDomainSeparator();
    }

    function _getProtocolDomainSeparator() internal view returns (bytes32) {
        VerdictStoreStorage storage $ = _getVerdictStoreStorage();
        return $.protocolDomainSeparator;
    }

    /// @dev Authorize an upgrade of the protocol. Only the admin can authorize an upgrade.
    function _authorizeUpgrade(address newImplementation) internal override restricted {}

    /// Store a verdict in the store.
    /// The contract will be able to sign the verdict hash through the EIP1271 interface.
    /// @param verdict the verdict to store
    function storeVerdict(LibVerdict.Verdict memory verdict) external override restricted {
        bytes32 verdictStructHash = LibVerdict.hash(verdict);
        bytes32 verdictHash = _protocolHash(verdictStructHash);

        // store the verdict signature
        _registerSignature(verdictHash);

        // publish the verdict to other chains
        _publishVerdict(verdictStructHash); //, verdict.payment_hash);

        emit VerdictStored(verdictHash);
    }

    /// TODO This function will be used to propagate the verdict to some other chains thougth cross chain protocol such as whormhole.
    /// @param verdictStructHash_  the verdict struct hash
    function _publishVerdict(bytes32 verdictStructHash_) internal {
        // TODO
    }

    /// @param structHash  the hash of the struct to sign
    function _protocolHash(bytes32 structHash) internal view returns (bytes32) {
        return LibEIP712.hashTypedDataV4(_getProtocolDomainSeparator(), structHash);
    }
}
