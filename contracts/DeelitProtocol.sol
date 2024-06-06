// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "./interfaces/IDeelitProtocol.sol";
import "./TransfertManager.sol";


/// @custom:security-contact dev@deelit.net
contract DeelitProtocol is IDeelitProtocol, TransfertManager, AccessControlUpgradeable, PausableUpgradeable, EIP712Upgradeable, UUPSUpgradeable {
    using SignatureChecker for address;

    /// @notice Payment state. The 'payer' property is also used to determine if a payment is initiated or not.
    struct State {
        address payer; // payer address
        bytes32 acceptance; // acceptance hash
        bytes32 conflict; // conflict hash
        bytes32 verdict; // verdict hash
        uint256 vesting; // vesting time for payment claim => payment time + vesting_period
    }

    // Define roles
    bytes32 public constant JUDGE_ROLE = keccak256("JUDGE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER");

    // Define auto acceptance due to expiration
    bytes32 public constant AUTO_ACCEPTANCE = keccak256("AUTO_ACCEPTANCE");

    // Define EIP712 domain separator
    string public constant EIP712_DOMAIN_NAME = "deelit.net";
    string public constant EIP712_DOMAIN_VERSION = "1";

    // Mapping of payment hashes to payment states
    mapping(bytes32 => State) public payments;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(LibFee.Fee calldata fees_) public initializer {
        __AccessControl_init();
        __Pausable_init();
        __EIP712_init(EIP712_DOMAIN_NAME, EIP712_DOMAIN_VERSION);
        __TransfertManager_init(fees_);
        __UUPSUpgradeable_init();

        // set roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @dev Set the fees for the protocol.
    /// @param fees_ the fees to set. see LibFee.Fee struct.
    function setFees(LibFee.Fee calldata fees_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        // checks are done in the TransfertManager
        _setFees(fees_);
    }

    function pay(LibTransaction.Transaction calldata tx_, bytes calldata paymentSignature_) external payable whenNotPaused {
        // compute hashes
        bytes32 paymentHash = _hash(LibPayment.hash(tx_.payment));
        bytes32 offerHash = _hash(LibOffer.hash(tx_.offer));

        require(tx_.payment.offer_hash == offerHash, "DeelitProtocol: Invalid payment offer hash");
        require(tx_.payment.destination_address.length == 20, "DeelitProtocol: Invalid payment destination address");
        require(tx_.payment.expiration_time > block.timestamp, "DeelitProtocol: Payment expired");
        require(payments[paymentHash].payer == address(0), "DeelitProtocol: Payment already initiated");

        // verify signature and validate payment datas
        _verifySignature(tx_.payment.from_address, paymentHash, paymentSignature_);

        // update payment state
        payments[paymentHash] = State({
            payer: msg.sender,
            conflict: bytes32(0),
            verdict: bytes32(0),
            acceptance: bytes32(0),
            vesting: block.timestamp + tx_.payment.vesting_period
        });

        // process payment
        _doPay(tx_);

        emit Payed(paymentHash);
    }

    function claim(LibTransaction.Transaction calldata tx_) external whenNotPaused {
        // compute payment hash
        bytes32 paymentHash = _hash(LibPayment.hash(tx_.payment));
        bytes32 offerHash = _hash(LibOffer.hash(tx_.offer));

        // retrieve payment state
        State storage state = payments[paymentHash];

        // validate inputs and state
        require(tx_.payment.offer_hash == offerHash, "DeelitProtocol: Invalid payment offer hash");
        require(state.payer != address(0), "DeelitProtocol: Payment not initiated");
        require(state.acceptance == bytes32(0), "DeelitProtocol: Payment already claimed");
        require(state.conflict == bytes32(0), "DeelitProtocol: Payment in conflict");
        require(state.vesting < block.timestamp, "DeelitProtocol: Payment deadline not reached. acceptance needed");

        // update payment state
        state.acceptance = AUTO_ACCEPTANCE;

        // process claim payment
        _doClaim(tx_);

        emit Claimed(paymentHash, AUTO_ACCEPTANCE);
    }

    function claimAccepted(
        LibTransaction.Transaction calldata tx_,
        LibAcceptance.Acceptance calldata acceptance_,
        bytes calldata acceptanceSignature_
    ) external whenNotPaused {
        // compute hashes
        bytes32 paymentHash = _hash(LibPayment.hash(tx_.payment));
        bytes32 offerHash = _hash(LibOffer.hash(tx_.offer));
        bytes32 acceptanceHash = _hash(LibAcceptance.hash(acceptance_));

        // retrieve payment state
        State storage state = payments[paymentHash];

        require(tx_.payment.offer_hash == offerHash, "DeelitProtocol: Invalid payment offer hash");
        require(acceptance_.payment_hash == paymentHash, "DeelitProtocol: Invalid acceptance payment hash");
        require(acceptance_.from_address == tx_.offer.from_address, "DeelitProtocol: Invalid acceptance from address");
        require(state.payer != address(0), "DeelitProtocol: Payment not initiated");
        require(state.acceptance == bytes32(0), "DeelitProtocol: Payment already claimed");
        require(state.conflict == bytes32(0), "DeelitProtocol: Payment in conflict");

        // verify signature if not called by payer
        if (msg.sender != acceptance_.from_address) {
            _verifySignature(acceptance_.from_address, acceptanceHash, acceptanceSignature_);
        }

        // update payment state
        state.acceptance = acceptanceHash;

        // process claim payment
        _doClaim(tx_);

        emit Claimed(paymentHash, acceptanceHash);
    }

    function conflict(
        LibTransaction.Transaction calldata tx_,
        LibConflict.Conflict calldata conflict_,
        bytes calldata conflictSignature_
    ) external whenNotPaused {
        // compute hashes
        bytes32 paymentHash = _hash(LibPayment.hash(tx_.payment));
        bytes32 offerHash = _hash(LibOffer.hash(tx_.offer));
        bytes32 conflictHash = _hash(LibConflict.hash(conflict_));

        // retrieve payment state
        State storage state = payments[paymentHash];

        require(conflict_.payment_hash == paymentHash, "DeelitProtocol: Invalid conflict payment hash");
        require(tx_.payment.offer_hash == offerHash, "DeelitProtocol: Invalid payment offer hash");
        require(state.acceptance == bytes32(0), "DeelitProtocol: Payment already claimed");
        require(state.conflict == bytes32(0), "DeelitProtocol: Payment already in conflict");
        require(state.verdict == bytes32(0), "DeelitProtocol: Payment already resolved");

        // verify conflict signature if caller not originator
        if (msg.sender != conflict_.from_address) {
            _verifySignature(conflict_.from_address, conflictHash, conflictSignature_);
        }

        // update payment state
        state.conflict = conflictHash;

        emit Conflicted(paymentHash, conflictHash);
    }

    function resolve(LibTransaction.Transaction calldata tx_, LibVerdict.Verdict calldata verdict_, bytes calldata signature_) external whenNotPaused {
        // compute hashes
        bytes32 paymentHash = _hash(LibPayment.hash(tx_.payment));
        bytes32 verdictHash = _hash(LibVerdict.hash(verdict_));

        // retrieve payment state
        State storage state = payments[verdict_.payment_hash];

        require(verdict_.payment_hash == paymentHash, "DeelitProtocol: Invalid verdict payment hash");
        require(hasRole(JUDGE_ROLE, verdict_.from_address), "DeelitProtocol: Invalid verdict issuer");
        require(state.acceptance == bytes32(0), "DeelitProtocol: Payment already claimed");
        require(state.conflict != bytes32(0), "DeelitProtocol: Payment not in conflict");
        require(state.verdict == bytes32(0), "DeelitProtocol: Payment already resolved");

        // verify signature if not called by judge
        if (msg.sender != verdict_.from_address) {
            _verifySignature(verdict_.from_address, verdictHash, signature_);
        }

        // update payment state
        state.verdict = verdictHash;

        // process verdict
        _doResolve(tx_, verdict_);

        emit Verdicted(paymentHash, verdictHash);
    }

    /// @dev validate a signature originator. Handle EIP1271 and EOA signatures using SignatureChecker library.
    /// @param signer_ the expected signer address
    /// @param digest_ the digest hash supposed to be signed
    /// @param signature_ the signature to verify
    function _verifySignature(address signer_, bytes32 digest_, bytes calldata signature_) private view {
        bool isValid = signer_.isValidSignatureNow(digest_, signature_);
        require(isValid, "DeelitProtocol: Invalid signature");
    }

    /// @dev Compute the hash of a data structure following EIP-712 spec.
    /// @param dataHash_ the structHash(message) to hash
    function _hash(bytes32 dataHash_) private view returns (bytes32) {
        return _hashTypedDataV4(dataHash_);
    }

    /// @dev Pause the protocol.
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /// @dev Unpause the protocol.
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
