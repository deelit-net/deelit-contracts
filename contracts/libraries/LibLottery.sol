// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {LibTransaction} from "./LibTransaction.sol";
import {LibFee} from "./LibFee.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

/// @custom:security-contact dev@deelit.net
library LibLottery {
    using Math for uint;
    bytes32 private constant LOTTERY_TYPEHASH =
        keccak256("Lottery(address from_address,bytes32 product_hash,uint256 nb_tickets,uint256 ticket_price,address token_address,Fee fee,Fee protocol_fee,uint256 expiration_time)Fee(address recipient,uint48 amount_bp)");

    struct Lottery {
        address from_address; // address of the lottery creator
        bytes32 product_hash; // product hash related to the lottery
        uint256 nb_tickets; // number of tickets
        uint256 ticket_price; // price of a ticket
        address token_address; // asset address
        LibFee.Fee fee; // fee of the lottery
        LibFee.Fee protocol_fee; // fee of the protocol
        uint256 expiration_time; // expiration time
    }

    function hash(Lottery calldata lottery) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    LOTTERY_TYPEHASH,
                    lottery.from_address,
                    lottery.product_hash,
                    lottery.nb_tickets,
                    lottery.ticket_price,
                    lottery.token_address,
                    LibFee.hash(lottery.fee),
                    LibFee.hash(lottery.protocol_fee),
                    lottery.expiration_time
                )
            );
    }

    function calculateTotalPrice(Lottery calldata lottery) internal pure returns (uint256) {
        (bool success, uint256 total) = lottery.ticket_price.tryMul(lottery.nb_tickets);
        assert(success);
        return total;
    }

    function calculateParticipation(LibLottery.Lottery calldata lottery) internal pure returns (uint256 totalParticipation) {
        uint256 lotteryFee = LibFee.calculateFee(lottery.ticket_price, lottery.fee.amount_bp);
        uint256 protocolFee = LibFee.calculateFee(lottery.ticket_price, lottery.protocol_fee.amount_bp);

        (bool success, uint256 ticketPrice) = lottery.ticket_price.tryAdd(protocolFee);
        if (!success) {
            revert("Lottery: overflow encountered");
        }
        (success, totalParticipation) = ticketPrice.tryAdd(lotteryFee);
        if (!success) {
            revert("Lottery: overflow encountered");
        }
    }

    function calculateLotteryPrices(Lottery calldata lottery) internal pure returns (uint256 lotteryFee , uint256 totalWithProtocolFee) {
        uint256 totalPrice = calculateTotalPrice(lottery);
        lotteryFee = LibFee.calculateFee(totalPrice, lottery.fee.amount_bp);
        uint256 protocolFee = LibFee.calculateFee(totalPrice, lottery.protocol_fee.amount_bp);

        bool success;
        (success, totalWithProtocolFee) = totalPrice.tryAdd(protocolFee);
        if (!success) {
            revert("Lottery: overflow encountered");
        }
    }
}
