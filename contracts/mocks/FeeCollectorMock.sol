// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "../interfaces/IFeeCollector.sol";

contract FeeCollectorMock is IFeeCollector {
    function collect() external payable override {
        // do nothing
    }

    function collectErc20(address token_) external override {
        // do nothing
    }
}
