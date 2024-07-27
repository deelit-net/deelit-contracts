// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IRandomProducer} from "../random/interfaces/IRandomProducer.sol";
import "hardhat/console.sol";

/// @title RandomProducerMock contract
/// @author d0x4545lit
/// @notice RandomProducerMock contract for mocking RandomProducer 
contract RandomProducerMock is IRandomProducer {

    uint256 public requestPrice;
    uint256 public releaseDelay;
    uint256 public requestCounter = 0;

    struct RequestStruct {
        uint256 releaseTime;
        uint256 paid;
        uint256 randomWord;
    }

    mapping (uint256 => RequestStruct) public requests;

    constructor(uint256 requestPrice_, uint256 releaseDelay_){
        require(requestPrice_ > 0, "RandomProducerMock: request price must be greater than 0");

        requestPrice = requestPrice_;
        releaseDelay = releaseDelay_;
    }

    function setRequestPrice(uint256 requestPrice_) external {
        requestPrice = requestPrice_;
    }

    function setReleaseDelay(uint256 releaseDelay_) external {
        releaseDelay = releaseDelay_;
    }

    function setRandomWord(uint256 requestId, uint256 randomWord) external {
        require(requests[requestId].paid > 0, "RandomProducerMock: request does not exist");
        requests[requestId].randomWord = randomWord;
    }

    function requestRandomWord() external payable override returns (uint256 requestId, uint256 reqPrice) {
        require(msg.value >= requestPrice, "RandomProducerMock: insufficient payment");
        
        requestCounter = ++requestCounter;

        RequestStruct storage request = requests[requestCounter];
        request.paid = requestPrice;
        request.releaseTime = block.timestamp + releaseDelay;
        request.randomWord = uint256(keccak256(abi.encodePacked(block.timestamp, requestCounter))); // pseudo random

        // refund excess payment
        if (msg.value > requestPrice) {
            payable(msg.sender).transfer(msg.value - requestPrice);
        }

        return (requestCounter, requestPrice);
    }

    function getRequestStatus(uint256 _requestId) external view override returns (uint256 paid, bool fulfilled, uint256 randomWord) {
        require(requests[_requestId].paid > 0, "RandomProducerMock: request does not exist");
        RequestStruct memory request = requests[_requestId];
        if (request.releaseTime <= block.timestamp) {
            return (request.paid, true, request.randomWord);
        } else {
            return (request.paid, false, 0);
        }
    }
}