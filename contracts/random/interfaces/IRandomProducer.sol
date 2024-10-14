// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title IRandomProducer interface
 * @notice Interface for the RandomProducer contract.
 * @notice The RandomProducer contract is responsible for generating random numbers.
 */
interface IRandomProducer {
    /// @dev Request the generation of a random word.
    function requestRandomWord() external returns (uint256 requestId);

    /// @dev Get the status of a request.
    /// @param _requestId The request id.
    function getRequestStatus(uint256 _requestId) external view returns (bool fulfilled, uint256 randomWord);
}
