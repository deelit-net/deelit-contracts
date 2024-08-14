// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessManagedUpgradeable} from "@openzeppelin/contracts-upgradeable/access/manager/AccessManagedUpgradeable.sol";
import {EIP712Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import {IAccessManager} from "@openzeppelin/contracts/access/manager/IAccessManager.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {ILottery, LibTransaction, LibVerdict} from "./interfaces/ILottery.sol";
import {LibPayment} from "../libraries/LibPayment.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";
import {LibLottery} from "../libraries/LibLottery.sol";
import {LibOffer} from "../libraries/LibOffer.sol";
import {LibEIP712} from "../libraries/LibEIP712.sol";
import {LibAccess} from "../libraries/LibAccess.sol";
import {BitMaps} from "@openzeppelin/contracts/utils/structs/BitMaps.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IDeelitProtocol} from "../protocol/interfaces/IDeelitProtocol.sol";
import {RandomConsumer, IRandomProducer} from "../random/RandomConsumer.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {FeeCollector, LibFee} from "../fee/FeeCollector.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title Lottery
/// @author d0x4545lit
/// @notice Lottery contract to manage lottery creation, participation, drawing and payment.
/// @custom:security-contact dev@deelit.net
contract Lottery is ILottery, RandomConsumer, FeeCollector, AccessManagedUpgradeable, EIP712Upgradeable, PausableUpgradeable, UUPSUpgradeable {
    using SafeERC20 for IERC20;
    using Address for address payable;
    using Math for uint256;

    // lottery state
    struct LotteryState {
        // lottery infos
        LotteryStatus status;
        uint256 randomRequestId; // random number request id to determine winner
        address cachedWinner; // cached winner address
        // protocol infos
        bytes32 paymentHash; // protocol payment hash
        bytes32 verdictHash; // protocol verdict hash
        // tickets infos
        uint256 ticketCount;
        mapping(address => uint256) tickets; // participants to ticket indexes mapping
        mapping(uint256 => address) participants; // ticket indexes to participants mapping. note: index starts at 1
        BitMaps.BitMap redeemed; // tickets redeemed bitmap
    }

    /// @custom:storage-location erc7201:deelit.storage.Lottery
    struct LotteryStorage {
        IAccessManager _manager;
        IDeelitProtocol _protocol;
        bytes32 _protocolDomainSeparator; // cached EIP712 domain separator
        mapping(bytes32 => LotteryState) _lotteries; // lottery state mapping
    }

    // keccak256(abi.encode(uint256(keccak256("deelit.storage.Lottery")) - 1)) & ~bytes32(uint256(0xff));
    bytes32 private constant LotteryStorageLocation = 0xd1cf091c595fc493f0b5779990274e2d871a6e5a155133013bc5fd60bcd09200;

    function _getLotteryStorage() private pure returns (LotteryStorage storage $) {
        assembly {
            $.slot := LotteryStorageLocation
        }
    }

    modifier onlyWinner(bytes32 lotteryHash) {
        require(msg.sender == _winner(lotteryHash), "Lottery: only winner can call");
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(IAccessManager manager_, IDeelitProtocol protocol_, IRandomProducer randomProducer_, LibFee.Fee calldata fees) public initializer {
        __AccessManaged_init(address(manager_));
        __RandomConsumer_init(randomProducer_);
        __EIP712_init("deelit.net", "1");
        __Pausable_init();
        __FeeCollector_init(fees);
        __UUPSUpgradeable_init();

        _setProtocol(protocol_);
    }

    function getProtocol() external view returns (IDeelitProtocol) {
        return _getProtocol();
    }

    function _getProtocol() private view returns (IDeelitProtocol) {
        LotteryStorage storage $ = _getLotteryStorage();
        return $._protocol;
    }

    function setProtocol(IDeelitProtocol protocol_) external restricted {
        _setProtocol(protocol_);
    }

    function _setProtocol(IDeelitProtocol protocol_) internal {
        require(address(protocol_) != address(0), "Lottery: protocol address is zero");
        (, string memory name, string memory version, uint256 chainId, address verifyingContract, , ) = protocol_.eip712Domain();

        LotteryStorage storage $ = _getLotteryStorage();
        $._protocol = protocol_;
        $._protocolDomainSeparator = LibEIP712.buildDomainSeparator(LibEIP712.EIP712Domain(name, version, chainId, verifyingContract));
    }

    function setRandomProducer(IRandomProducer randomProducer) external restricted {
        _setRandomProducer(randomProducer);
    }

    function _getLotteryState(bytes32 lotteryHash) internal view returns (LotteryState storage) {
        LotteryStorage storage $ = _getLotteryStorage();
        return $._lotteries[lotteryHash];
    }

    function getLotteryStatus(bytes32 lotteryHash) external view override returns (LotteryStatus, uint256, address) {
        LotteryState storage $_lottery = _getLotteryState(lotteryHash);
        return ($_lottery.status, $_lottery.ticketCount, $_lottery.cachedWinner);
    }

    function createLottery(LibLottery.Lottery calldata lottery) external whenNotPaused returns (bytes32 lotteryHash) {
        lotteryHash = _hash(LibLottery.hash(lottery));

        LotteryState storage $_lottery = _getLotteryState(lotteryHash);
        require($_lottery.status == LotteryStatus.None, "Lottery: lottery already exists");
        require(lottery.product_hash > 0, "Lottery: transaction hash is zero");
        require(lottery.nb_tickets > 0, "Lottery: nbTickets is zero");
        require(lottery.ticket_price > 0, "Lottery: ticketPrice is zero");
        require(LibFee.equal(lottery.fee, _getFees()), "Lottery: fee bp mismatch");
        // Note: no need to check protocol fee, it is checked on payment at protocol level.

        // store lottery state
        $_lottery.status = LotteryStatus.Open;

        // log event
        emit Created(lotteryHash, lottery);
    }

    function isFilled(LibLottery.Lottery calldata lottery) external view returns (bool) {
        return _isFilled(_hash(LibLottery.hash(lottery)), lottery);
    }

    function _isFilled(bytes32 lotteryHash, LibLottery.Lottery calldata lottery) internal view returns (bool) {
        LotteryState storage $_lottery = _getLotteryState(lotteryHash);
        return $_lottery.ticketCount == lottery.nb_tickets;
    }

    function participate(LibLottery.Lottery calldata lottery) external payable override whenNotPaused {
        bytes32 lotteryHash = _hash(LibLottery.hash(lottery));
        require(_exist(lotteryHash), "Lottery: lottery not found");
        require(!_isCanceled(lotteryHash), "Lottery: canceled");
        require(!_isFilled(lotteryHash, lottery), "Lottery: already filled");

        // update state
        LotteryState storage $_lottery = _getLotteryState(lotteryHash);
        $_lottery.ticketCount++;
        $_lottery.participants[$_lottery.ticketCount] = msg.sender;
        $_lottery.tickets[msg.sender] = $_lottery.ticketCount;

        // process payment
        if (lottery.token_address == address(0)) {
            _doParticipateNative(lottery);
        } else {
            _doParticipateErc20(IERC20(lottery.token_address), lottery);
        }

        // log event
        emit Participated(lotteryHash, msg.sender);
    }

    function _doParticipateNative(LibLottery.Lottery calldata lottery) private {
        uint256 totalWithFees = LibLottery.calculateParticipation(lottery);
        require(msg.value >= totalWithFees, "Lottery: insufficient value");

        // refund excess value
        uint256 rest = msg.value - totalWithFees;
        if (rest > 0) {
            payable(msg.sender).sendValue(rest);
        }
    }

    function _doParticipateErc20(IERC20 token, LibLottery.Lottery calldata lottery) private {
        uint256 totalWithFees = LibLottery.calculateParticipation(lottery);
        require(token.allowance(msg.sender, address(this)) >= totalWithFees, "Lottery: insufficient allowance");

        // transfer token
        token.safeTransferFrom(msg.sender, address(this), totalWithFees);
    }

    function redeem(LibLottery.Lottery calldata lottery, address participant) external override whenNotPaused {
        bytes32 lotteryHash = _hash(LibLottery.hash(lottery));
        require(_isCanceled(lotteryHash), "Lottery: not canceled");
        require(_isParticipant(lotteryHash, participant), "Lottery: not participant");
        require(!_isRedeemed(lotteryHash, participant), "Lottery: already redeemed");

        // update state
        LotteryState storage $_lottery = _getLotteryState(lotteryHash);
        uint256 ticketIndex = $_lottery.tickets[participant];
        BitMaps.set($_lottery.redeemed, ticketIndex);

        // calculate redemption
        uint256 totalWithFees = LibLottery.calculateParticipation(lottery);

        // process redemption
        if (lottery.token_address == address(0)) {
            payable(participant).sendValue(totalWithFees);
        } else {
            IERC20 erc20 = IERC20(lottery.token_address);
            erc20.safeTransfer(participant, totalWithFees);
        }

        // log event
        emit Redeemed(lotteryHash, participant);
    }

    function cancel(LibLottery.Lottery calldata lottery) external override whenNotPaused {
        bytes32 lotteryHash = _hash(LibLottery.hash(lottery));
        require(_exist(lotteryHash), "Lottery: lottery not found");
        require(!_isDrawn(lotteryHash), "Lottery: already drawn");
        require(!_isCanceled(lotteryHash), "Lottery: already canceled");

        // if not expire and not the lottery creator, check if admin
        if (lottery.expiration_time > block.timestamp && lottery.from_address != msg.sender) {
            (bool isAdmin, ) = IAccessManager(authority()).hasRole(LibAccess.ADMIN_ROLE, msg.sender);
            require(isAdmin, "Lottery: not admin");
        }

        // update state
        LotteryState storage $_lottery = _getLotteryState(lotteryHash);
        $_lottery.status = LotteryStatus.Canceled;

        // log event
        emit Canceled(lotteryHash, msg.sender);
    }

    function draw(LibLottery.Lottery calldata lottery) external override whenNotPaused {
        bytes32 lotteryHash = _hash(LibLottery.hash(lottery));

        require(!_isCanceled(lotteryHash), "Lottery: canceled");
        require(!_isDrawn(lotteryHash), "Lottery: already drawn");
        require(_isFilled(lotteryHash, lottery), "Lottery: not filled");

        // request random number
        uint256 requestId = _requestRandomNumber();

        // update state
        LotteryState storage $_lottery = _getLotteryState(lotteryHash);
        $_lottery.status = LotteryStatus.Drawn;
        $_lottery.randomRequestId = requestId;

        emit Drawn(lotteryHash);
    }

    function _isDrawn(bytes32 lotteryHash) internal view returns (bool) {
        require(_exist(lotteryHash), "Lottery: lottery not found");

        LotteryState storage $_lottery = _getLotteryState(lotteryHash);
        return $_lottery.randomRequestId > 0;
    }

    /// @dev Important! The protocol payment requester is responsible to align transaction inputs with the lottery datas.
    /// !WARNING! Note that we do not check the offer price versus the lottery price here.
    /// It is not an issue for native payment because even if the protocol attempt to refund the excess payments, the transaction will failed cause the lottery contract is not a payable.
    /// For ERC20 payment, we may implement a check so we prevent locking tokens on this contract.
    function pay(
        LibLottery.Lottery calldata lottery,
        LibTransaction.Transaction calldata transaction,
        bytes calldata paymentSignature
    ) external override whenNotPaused {
        bytes32 lotteryHash = _hash(LibLottery.hash(lottery));
        address winner_ = _winner(lotteryHash); //  _winner(lotteryHash) also check if lottery is drawn.

        require(!_isCanceled(lotteryHash), "Lottery: canceled");
        require(transaction.offer.from_address == winner_, "Lottery: from address mismatch with winner address");
        require(transaction.offer.product_hash == lottery.product_hash, "Lottery: product hash mismatch");
        require(transaction.offer.token_address == lottery.token_address, "Lottery: asset mismatch");

        // compute payment hash
        bytes32 paymentHash = _protocolHash(LibPayment.hash(transaction.payment));

        // update lottery state
        LotteryState storage $_lottery = _getLotteryState(lotteryHash);
        $_lottery.status = LotteryStatus.Paid;
        $_lottery.paymentHash = paymentHash;

        // process payment
        (uint256 lotteryFee, uint256 totalWithProtocolFee) = LibLottery.calculateLotteryPrices(lottery);

        if (lottery.token_address == address(0)) {
            _collectFee(_getFees().recipient, lotteryFee);

            _getProtocol().pay{value: totalWithProtocolFee}(transaction, paymentSignature, winner_);
        } else {
            IERC20 erc20 = IERC20(lottery.token_address);

            _collectFeeErc20(erc20, _getFees().recipient, lotteryFee);

            erc20.approve(address(_getProtocol()), totalWithProtocolFee);
            _getProtocol().pay(transaction, paymentSignature, winner_);
        }

        // log event
        emit Paid(lotteryHash, paymentHash);
    }

    function isPaid(bytes32 lotteryHash) external view override returns (bool) {
        return _isPaid(lotteryHash);
    }

    function _isPaid(bytes32 lotteryHash) internal view returns (bool) {
        LotteryState storage $_lottery = _getLotteryState(lotteryHash);
        return $_lottery.status == LotteryStatus.Paid;
    }

    function isCanceled(bytes32 lotteryHash) external view override returns (bool) {
        return _isCanceled(lotteryHash);
    }

    function _isCanceled(bytes32 lotteryHash) internal view returns (bool) {
        LotteryState storage $_lottery = _getLotteryState(lotteryHash);
        return $_lottery.status == LotteryStatus.Canceled;
    }

    function winner(bytes32 lotteryHash) external returns (address) {
        return _winner(lotteryHash);
    }

    function _winner(bytes32 lotteryHash) internal returns (address) {
        require(_isDrawn(lotteryHash), "Lottery: winner not drawn");

        // use cached winner if available
        LotteryState storage $_lottery = _getLotteryState(lotteryHash);

        if ($_lottery.cachedWinner != address(0)) {
            return $_lottery.cachedWinner;
        }

        // try to retreive winner from random producer
        (bool fullfilled, uint256 randomWord) = _getRequestStatus($_lottery.randomRequestId);
        require(fullfilled, "Lottery: random number not yet fullfilled");

        uint256 winnerTicket = (randomWord % $_lottery.ticketCount) + 1; // random btw 1 and ticketCount
        $_lottery.cachedWinner = $_lottery.participants[winnerTicket];

        emit Won(lotteryHash, $_lottery.cachedWinner);
        return $_lottery.cachedWinner;
    }

    function isParticipant(bytes32 lotteryHash, address participant) external view returns (bool) {
        return _isParticipant(lotteryHash, participant);
    }

    function _isParticipant(bytes32 lotteryHash, address participant) internal view returns (bool) {
        require(_exist(lotteryHash), "Lottery: lottery not found");
        LotteryState storage $_lottery = _getLotteryState(lotteryHash);
        return $_lottery.tickets[participant] > 0;
    }

    function isRedeemed(bytes32 lotteryHash, address participant) external view returns (bool) {
        return _isRedeemed(lotteryHash, participant);
    }

    function _isRedeemed(bytes32 lotteryHash, address participant) internal view returns (bool) {
        require(_isParticipant(lotteryHash, participant), "Lottery: not participant");
        LotteryState storage $_lottery = _getLotteryState(lotteryHash);
        return BitMaps.get($_lottery.redeemed, $_lottery.tickets[participant]);
    }

    function _exist(bytes32 lotteryHash) internal view returns (bool) {
        LotteryState storage $_lottery = _getLotteryState(lotteryHash);
        return $_lottery.status != LotteryStatus.None;
    }

    /// @dev Compute the hash of a data structure following EIP-712 spec.
    /// @param structHash the structHash(message) to hash
    function _hash(bytes32 structHash) private view returns (bytes32) {
        return _hashTypedDataV4(structHash);
    }

    /// @dev Compute the hash of a data structure following EIP-712 spec for the DeelitProtocol contract.
    /// @param structHash the structHash(message) to hash
    function _protocolHash(bytes32 structHash) internal view returns (bytes32) {
        LotteryStorage storage $ = _getLotteryStorage();
        return LibEIP712.hashTypedDataV4($._protocolDomainSeparator, structHash);
    }

    /// @dev Authorize an upgrade of the protocol. Only the admin can authorize an upgrade.
    function _authorizeUpgrade(address newImplementation) internal override restricted {
        // nothing to do
    }

    /// @dev Pause the lottery.
    function pause() external restricted {
        _pause();
    }

    /// @dev Unpause the lottery.
    function unpause() external restricted {
        _unpause();
    }
}
