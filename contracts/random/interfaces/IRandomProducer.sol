// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;


/**
 * @title IRandomProducer interface
 * @notice Interface for the RandomProducer contract.
 * @notice The RandomProducer contract is responsible for generating random numbers.
 */
interface IRandomProducer {
    
    function requestRandomWord() external payable returns (uint256 requestId, uint256 reqPrice);

    function getRequestStatus(uint256 _requestId) external view returns (uint256 paid, bool fulfilled, uint256 randomWord);

}
