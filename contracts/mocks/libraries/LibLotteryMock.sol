// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "../../libraries/LibLottery.sol";

contract LibLotteryMock {
    function hash(LibLottery.Lottery calldata lottery) external pure returns (bytes32) {
        return LibLottery.hash(lottery);
    }
}
