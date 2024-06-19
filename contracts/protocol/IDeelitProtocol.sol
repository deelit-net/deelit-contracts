// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {LibTransaction} from "../libraries/LibTransaction.sol";
import {LibConflict} from "../libraries/LibConflict.sol";
import {LibVerdict} from "../libraries/LibVerdict.sol";
import {LibAcceptance} from "../libraries/LibAcceptance.sol";

/// @title Deelit Protocol Interface
/// @author d0x4545lit
/// @notice Interface for the Deelit Protocol.
/// @dev This interface define the main functions of the Deelit Protocol.
/// @custom:security-contact dev@deelit.net
interface IDeelitProtocol {
    
    event Payed(bytes32 indexed paymentHash_);
    event Claimed(bytes32 indexed paymentHash_, bytes32 indexed acceptanceHash_);
    event Conflicted(bytes32 indexed paymentHash_, bytes32 indexed conflictHash_);
    event Verdicted(bytes32 indexed paymentHash_, bytes32 indexed verdictHash_);

    /// @notice Initiate a payment.
    /// @param tx_ the payment and offer details
    /// @param paymentSignature_  the payment signature
    function pay(LibTransaction.Transaction calldata tx_, bytes calldata paymentSignature_) external payable;

    /// @notice Claim a payment with an expired vesting period.
    /// @param tx_ the payment and offer details
    function claim(LibTransaction.Transaction calldata tx_) external;

    /// @notice Claim a payment with an acceptance signature. This allows the payee to claim the payment before the end of the vesting period.
    /// @dev The signature is required if the caller is not the conflict initiator.
    /// @param tx_ the payment and offer details
    /// @param acceptance_ the acceptance details
    /// @param acceptanceSignature_ the acceptance signature (optional if called by payer)
    function claimAccepted(
        LibTransaction.Transaction calldata tx_,
        LibAcceptance.Acceptance calldata acceptance_,
        bytes calldata acceptanceSignature_
    ) external;

    /// @notice Initiate a conflict on a payment.
    /// @dev The signature is required if the caller is not the conflict initiator.
    /// @param tx_ the payment and offer details
    /// @param conflict_  the conflict details
    /// @param conflictSignature_  the conflict signature
    function conflict(LibTransaction.Transaction calldata tx_, LibConflict.Conflict calldata conflict_, bytes calldata conflictSignature_) external;

    /// @notice Resolve a conflict on a payment.
    /// @dev The signature is required if the caller is not the conflict resolver.
    /// @param tx_ the payment and offer details
    /// @param verdict_ the verdict details
    /// @param signature_ the verdict signature
    function resolve(LibTransaction.Transaction calldata tx_, LibVerdict.Verdict calldata verdict_, bytes calldata signature_) external;
}
