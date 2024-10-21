// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessManagedUpgradeable, IAccessManager} from "@openzeppelin/contracts-upgradeable/access/manager/AccessManagedUpgradeable.sol";
import {GovernorUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/GovernorUpgradeable.sol";
import {GovernorSettingsUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorSettingsUpgradeable.sol";
import {GovernorStorageUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorStorageUpgradeable.sol";
import {GovernorCountingSimpleUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorCountingSimpleUpgradeable.sol";
import {GovernorVotesUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesUpgradeable.sol";
import {TimelockControllerUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/TimelockControllerUpgradeable.sol";
import {GovernorTimelockAccessUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorTimelockAccessUpgradeable.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";

/// @title DeeAO governance contract
/// @author d0x4545lit
/// @notice DeeAO is a governance contract for the Deelit protocol.
/// @custom:security-contact dev@deelit.net
contract DeeAO is
    Initializable,
    GovernorUpgradeable,
    GovernorSettingsUpgradeable,
    GovernorCountingSimpleUpgradeable,
    GovernorStorageUpgradeable,
    GovernorVotesUpgradeable,
    GovernorTimelockAccessUpgradeable,
    AccessManagedUpgradeable,
    UUPSUpgradeable
{
    string private constant NAME = "DeeAO";
    uint48 public constant VOTING_DELAY = 1 days; // 1 day of voting delay
    uint32 public constant VOTING_PERIOD = 3 weeks; // 3 weeks of voting period
    uint256 public constant MIN_QORUM = 50_000_000e18; // 5% of the total supply
    uint256 public constant MIN_PROPOSAL_THRESHOLD = 100_000e18; // 0.01% of the total supply

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Contract initializer
     * @param _token The token used for voting
     * @param _initialAuthority The initial authority
     * @param _baseDelay The base delay for the timelock
     */
    function initialize(IVotes _token, address _initialAuthority, uint32 _baseDelay) public initializer {
        __Governor_init(NAME);
        __GovernorSettings_init(VOTING_DELAY, VOTING_PERIOD, MIN_PROPOSAL_THRESHOLD);
        __GovernorCountingSimple_init();
        __GovernorStorage_init();
        __GovernorVotes_init(_token);
        __GovernorTimelockAccess_init(_initialAuthority, _baseDelay);
        __AccessManaged_init(_initialAuthority);
        __UUPSUpgradeable_init();
    }

    /**
     * @inheritdoc UUPSUpgradeable
     */
    function _authorizeUpgrade(address newImplementation) internal override restricted {}

    /**
     * @inheritdoc GovernorUpgradeable
     */
    function quorum(uint256 /* blockNumber */) public pure override returns (uint256) {
        return MIN_QORUM;
    }

    // The following functions are overrides required by Solidity.

    /**
     * @inheritdoc GovernorUpgradeable
     */
    function votingDelay() public view override(GovernorUpgradeable, GovernorSettingsUpgradeable) returns (uint256) {
        return super.votingDelay();
    }

    /**
     * @inheritdoc GovernorUpgradeable
     */
    function votingPeriod() public view override(GovernorUpgradeable, GovernorSettingsUpgradeable) returns (uint256) {
        return super.votingPeriod();
    }

    /**
     * @inheritdoc GovernorUpgradeable
     */
    function proposalNeedsQueuing(uint256 proposalId) public view override(GovernorUpgradeable, GovernorTimelockAccessUpgradeable) returns (bool) {
        return super.proposalNeedsQueuing(proposalId);
    }

    /**
     * @inheritdoc GovernorUpgradeable
     */
    function proposalThreshold() public view override(GovernorUpgradeable, GovernorSettingsUpgradeable) returns (uint256) {
        return super.proposalThreshold();
    }

    /**
     *
     * @inheritdoc GovernorTimelockAccessUpgradeable
     */
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public virtual override(GovernorUpgradeable, GovernorTimelockAccessUpgradeable) returns (uint256) {
        return super.propose(targets, values, calldatas, description);
    }

    /**
     * @inheritdoc GovernorUpgradeable
     */
    function _propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description,
        address proposer
    ) internal override(GovernorUpgradeable, GovernorStorageUpgradeable) returns (uint256) {
        return super._propose(targets, values, calldatas, description, proposer);
    }

    /**
     * @inheritdoc GovernorTimelockAccessUpgradeable
     */
    function _queueOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(GovernorUpgradeable, GovernorTimelockAccessUpgradeable) returns (uint48) {
        return super._queueOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    /**
     * @inheritdoc GovernorTimelockAccessUpgradeable
     */
    function _executeOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(GovernorUpgradeable, GovernorTimelockAccessUpgradeable) {
        super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    /**
     * @inheritdoc GovernorTimelockAccessUpgradeable
     */
    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(GovernorUpgradeable, GovernorTimelockAccessUpgradeable) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }
}
