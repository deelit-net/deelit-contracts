// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {LibTransaction} from "../../libraries/LibTransaction.sol";
import {LibConflict} from "../../libraries/LibConflict.sol";
import {LibVerdict} from "../../libraries/LibVerdict.sol";
import {LibAcceptance} from "../../libraries/LibAcceptance.sol";
import {IERC5267} from "@openzeppelin/contracts/interfaces/IERC5267.sol";

/// @title Deelit Protocol Interface
/// @author d0x4545lit
/// @notice Interface for the Deelit Protocol.
/// @dev This interface define the main functions of the Deelit Protocol.
/// @custom:security-contact dev@deelit.net
interface IDeelitProtocol is IERC5267 {
    
    event Payed(bytes32 indexed paymentHash_);
    event Claimed(bytes32 indexed paymentHash_, bytes32 indexed acceptanceHash_);
    event Conflicted(bytes32 indexed paymentHash_, bytes32 indexed conflictHash_);
    event Verdicted(bytes32 indexed paymentHash_, bytes32 indexed verdictHash_);

    /// @notice Initiate a payment.
    /// @param tx_ the payment and offer details
    /// @param paymentSignature  the payment signature
    /// @param refundAddress optional refund address to process the refund
    function pay(LibTransaction.Transaction calldata tx_, bytes calldata paymentSignature, address refundAddress) external payable;

    /// @notice Claim a payment with an expired vesting period.
    /// @param tx_ the payment and offer details
    function claim(LibTransaction.Transaction calldata tx_) external;

    /// @notice Claim a payment with an acceptance signature. This allows the payee to claim the payment before the end of the vesting period.
    /// @dev The signature is required if the caller is not the conflict initiator.
    /// @param tx_ the payment and offer details
    /// @param acceptance the acceptance details
    /// @param acceptanceSignature the acceptance signature (optional if called by payer)
    function claimAccepted(
        LibTransaction.Transaction calldata tx_,
        LibAcceptance.Acceptance calldata acceptance,
        bytes calldata acceptanceSignature
    ) external;

    /// @notice Initiate a conflict on a payment.
    /// @dev The signature is required if the caller is not the conflict initiator.
    /// @param tx_ the payment and offer details
    /// @param conflict  the conflict details
    /// @param conflictSignature  the conflict signature
    function conflict(LibTransaction.Transaction calldata tx_, LibConflict.Conflict calldata conflict, bytes calldata conflictSignature) external;

    /// @notice Resolve a conflict on a payment.
    /// @dev The signature is required if the caller is not the conflict resolver.
    /// @param tx_ the payment and offer details
    /// @param verdict the verdict details
    /// @param verdictSignature the verdict signature
    function resolve(LibTransaction.Transaction calldata tx_, LibVerdict.Verdict calldata verdict, bytes calldata verdictSignature) external;

    /// @notice Get the status of a payment.
    /// @param paymentHash the payment hash
    /// @return paid true if the payment has been paid
    /// @return claimHash hash of the claim
    /// @return conflictHash hash of the conflict
    /// @return verdictHash hash of the verdict
    function getPaymentStatus(bytes32 paymentHash) external view returns (bool paid, bytes32 claimHash, bytes32 conflictHash, bytes32 verdictHash);
}
