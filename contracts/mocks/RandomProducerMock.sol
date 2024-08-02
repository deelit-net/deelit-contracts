// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IRandomProducer} from "../random/interfaces/IRandomProducer.sol";
import "hardhat/console.sol";

/// @title RandomProducerMock contract
/// @author d0x4545lit
/// @notice RandomProducerMock contract for mocking RandomProducer 
contract RandomProducerMock is IRandomProducer {

    uint256 public releaseDelay;
    uint256 public requestCounter = 0;

    struct RequestStruct {
        uint256 releaseTime;
        bool exists;
        uint256 randomWord;
    }

    mapping (uint256 => RequestStruct) public requests;

    constructor(uint256 releaseDelay_){
        releaseDelay = releaseDelay_;
    }

    function setReleaseDelay(uint256 releaseDelay_) external {
        releaseDelay = releaseDelay_;
    }

    function setRandomWord(uint256 requestId, uint256 randomWord) external {
        require(requests[requestId].exists, "RandomProducerMock: request does not exist");
        requests[requestId].randomWord = randomWord;
    }

    function requestRandomWord() external override returns (uint256) {
        requestCounter = ++requestCounter;

        RequestStruct storage request = requests[requestCounter];
        request.exists = true;
        request.releaseTime = block.timestamp + releaseDelay;
        request.randomWord = uint256(keccak256(abi.encodePacked(block.timestamp, requestCounter))); // pseudo random

        return requestCounter;
    }

    function getRequestStatus(uint256 _requestId) external view override returns (bool fulfilled, uint256 randomWord) {
        require(requests[_requestId].exists, "RandomProducerMock: request does not exist");
        RequestStruct memory request = requests[_requestId];
        if (request.releaseTime <= block.timestamp) {
            return (true, request.randomWord);
        } else {
            return (false, 0);
        }
    }
}