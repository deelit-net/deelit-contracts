// SPDX-License-Identifier: MIT
// An example of a consumer contract that directly pays for each request.
pragma solidity 0.8.24;

import {IRandomProducer} from "./interfaces/IRandomProducer.sol";
import {IAccessManager} from "@openzeppelin/contracts/access/manager/IAccessManager.sol";
import {AccessManaged} from "@openzeppelin/contracts/access/manager/AccessManaged.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {VRFV2PlusWrapperConsumerBase} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFV2PlusWrapperConsumerBase.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

/**
 * @title RandomProducer
 * @notice A contract that produce random words through the Chainlink VRF service with native or Link payment.
 * @custom:security-contact dev@deelit.net
 */
contract RandomProducer is IRandomProducer, VRFV2PlusWrapperConsumerBase, AccessManaged {
    event RequestSent(uint256 requestId);
    event RequestFulfilled(uint256 requestId, uint256 randomWord, uint256 payment);

    struct RequestStatus {
        uint256 paid; // amount paid in link
        bool fulfilled; // whether the request has been successfully fulfilled
        uint256 randomWord;
    }
    mapping(uint256 => RequestStatus) public s_requests; /* requestId --> requestStatus */
    
    // past requests Id.
    uint256[] public requestIds;
    uint256 public lastRequestId;

    // The number of confirmations to wait for before callback
    uint16 public requestConfirmations;

    // Depends on the number of requested values that you want sent to the
    // fulfillRandomWords() function. Test and adjust
    // this limit based on the network that you select, the size of the request,
    // and the processing of the callback request in the fulfillRandomWords()
    // function.
    uint32 public callbackGasLimit;

    constructor(
        IAccessManager manager_,
        address wrapperAddress_,
        uint32 callbackGasLimit_,
        uint16 requestConfirmations_
    ) AccessManaged(address(manager_)) VRFV2PlusWrapperConsumerBase(wrapperAddress_) {
        callbackGasLimit = callbackGasLimit_;
        requestConfirmations = requestConfirmations_;
    }

    function setCallbackGasLimit(uint32 _callbackGasLimit) external restricted {
        callbackGasLimit = _callbackGasLimit;
    }

    function setRequestConfirmations(uint16 _requestConfirmations) external restricted {
        requestConfirmations = _requestConfirmations;
    }

    function requestRandomWord() external payable returns (uint256 requestId, uint256 reqPrice) {
        bytes memory extraArgs = VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: true}));
               
        (requestId, reqPrice) = requestRandomnessPayInNative(callbackGasLimit, requestConfirmations, 1, extraArgs);
        uint256 rest = msg.value - reqPrice;
        if (rest > 0) {
            (bool sent,) = msg.sender.call{value: rest}("");
            require(sent, "Failed to send Ether");
        }

        s_requests[requestId] = RequestStatus({paid: reqPrice, randomWord: 0, fulfilled: false});
        requestIds.push(requestId);
        lastRequestId = requestId;

        emit RequestSent(requestId);
    }

    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        require(s_requests[_requestId].paid > 0, "RandomProducer: request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWord = _randomWords[0];
        emit RequestFulfilled(_requestId, s_requests[_requestId].randomWord, s_requests[_requestId].paid);
    }

    function getRequestStatus(uint256 _requestId) external view returns (uint256 paid, bool fulfilled, uint256 randomWord) {
        require(s_requests[_requestId].paid > 0, "RandomProducer: request not found");
        RequestStatus memory request = s_requests[_requestId];
        return (request.paid, request.fulfilled, request.randomWord);
    }

    event Received(address, uint256);

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
