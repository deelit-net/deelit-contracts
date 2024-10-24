// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {LibLottery, LibTransaction} from "../../libraries/LibLottery.sol";
import {LibVerdict} from "../../libraries/LibVerdict.sol";

/**
 * @title ILottery
 * @author d0x4545lit
 * @dev Interface for the Lottery contract which manages lottery creation, participation, and resolution.
 * This interface allows users to participate in lotteries by depositing assets in the vault.
 * The contract can interact with the IDeelitProtocol to fulfill a payment, raise conflict and provide payment acceptance.
 */
interface ILottery {

    /**
     * @dev Enum representing the various states a lottery can be in.
     */
    enum LotteryStatus {
        None,     // Default state, lottery doesn't exist
        Open,     // Lottery is open for participation
        Drawn,    // Winner has been drawn (A random number has been request but may not have been fulfilled yet)
        Paid,     // Prize has been paid out to the protocol
        Canceled  // Lottery has been canceled
    }
    
    /**
     * @dev Emitted when a new lottery is created.
     * @param lotteryHash Hash of the lottery
     * @param lottery Struct containing lottery details
     */
    event Created(bytes32 indexed lotteryHash, LibLottery.Lottery lottery);

    /**
     * @dev Emitted when a user participates in a lottery.
     * @param lotteryHash Hash of the lottery
     * @param participant Address of the participant
     */
    event Participated(bytes32 indexed lotteryHash, uint256 ticketNumber, address participant);

    /**
     * @dev Emitted when a participant redeems their tickets after a lottery is canceled.
     * @param lotteryHash Hash of the lottery
     * @param participant Address of the participant redeeming their tickets
     */
    event Redeemed(bytes32 indexed lotteryHash, uint256 ticketNumber, address participant);

    /**
     * @dev Emitted when a lottery winner is drawn.
     * @param lotteryHash Hash of the lottery
     */
    event Drawn(bytes32 indexed lotteryHash, uint256 randomRequestId);

    /**
     * @dev Emitted when the lottery prize is paid out.
     * @param lotteryHash Hash of the lottery
     * @param transaction Transaction details with offer and payment details
     */
    event Paid(bytes32 indexed lotteryHash, LibTransaction.Transaction transaction);

    /**
     * @dev Emitted when a lottery is canceled.
     * @param lotteryHash Hash of the lottery
     * @param canceler Address of the account that canceled the lottery
     */
    event Canceled(bytes32 indexed lotteryHash, address canceler);

    /**
     * @dev Creates a new lottery.
     * @param lottery Struct containing the lottery details
     * @return bytes32 The unique identifier (hash) of the created lottery
     */
    function createLottery(LibLottery.Lottery calldata lottery) external returns (bytes32);

    /**
     * @dev Allows a user to participate in a lottery by buying tickets.
     * @param lottery Struct containing the lottery details
     */
    function participate(LibLottery.Lottery calldata lottery) external payable;

    /**
     * @dev Allows a participant to redeem their tickets for a refund if the lottery is canceled.
     * @param lottery Struct containing the lottery details
     * @param ticket Ticket to redeem
     */
    function redeem(LibLottery.Lottery calldata lottery, uint256 ticket) external;

    /**
     * @dev Cancels a lottery, allowing participants to redeem their tickets.
     * @param lottery Struct containing the lottery details
     */
    function cancel(LibLottery.Lottery calldata lottery) external; 

    /**
     * @dev Initiates the drawing process to determine the lottery winner.
     * @param lottery Struct containing the lottery details
     */
    function draw(LibLottery.Lottery calldata lottery) external;

    /**
     * @dev Pays out the lottery prize through the Deelit protocol.
     * @param lottery Struct containing the lottery details
     * @param transaction Transaction details with offer and payment details
     * @param paymentSignature Signature authorizing the payment to the protocol
     */
    function pay(LibLottery.Lottery calldata lottery, LibTransaction.Transaction calldata transaction, bytes calldata paymentSignature) external;
    
    /**
     * @dev Retrieves the ticket number of the winner of a lottery. Lottery must be in the Drawn state and VFR request must be fulfilled.
     * @param lotteryHash Hash of the lottery
     * @return uint256 The ticket number of the winner
     */
    function getWinnerTicket(bytes32 lotteryHash) external view returns (uint256);


    /**
     * @dev Retrieves the address of the winner of a lottery. Lottery must be in the Drawn state and VFR request must be fulfilled.
     * @param lotteryHash Hash of the lottery
     * @return address The address of the winner
     */
    function getWinnerAddress(bytes32 lotteryHash) external view returns (address);

    /**
     * @dev Retrieves the current status and number of tickets sold for a lottery.
     * @param lotteryHash Hash of the lottery
     * @return status Current status of the lottery
     * @return nbTicketSold Number of tickets sold
     * @return winner Address of the lottery winner. Zero address if no winner has been drawn or computed yet.
     */
    function getLotteryStatus(bytes32 lotteryHash) external view returns (LotteryStatus status, uint256 nbTicketSold, address winner);

    /**
     * @dev Retrieves the owner of a ticket.
     * @param lotteryHash Hash of the lottery
     * @param ticketNumber the ticket to check
     * @return address The address of the ticket owner
     */
    function getTicketOwner(bytes32 lotteryHash, uint256 ticketNumber) external view returns (address);

    /**
     * @dev Checks if an address is a participant in a lottery.
     * @param lotteryHash Hash of the lottery
     * @param ticketNumber Ticket number to check
     * @return bool True if the address is a participant, false otherwise
     */
    function isTicket(bytes32 lotteryHash, uint256 ticketNumber) external view returns (bool);

    /**
     * @dev Checks if a participant has redeemed their tickets for a canceled lottery.
     * @param lotteryHash Hash of the lottery
     * @param ticketNumber the ticket to check
     * @return bool True if the participant has redeemed their tickets, false otherwise
     */
    function isRedeemed(bytes32 lotteryHash, uint256 ticketNumber) external view returns (bool);

    /**
     * @dev Checks if all tickets for a lottery have been sold.
     * @param lottery Struct containing the lottery details
     * @return bool True if the lottery is filled, false otherwise
     */
    function isFilled(LibLottery.Lottery calldata lottery) external view returns (bool);

}