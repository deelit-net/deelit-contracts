// SPDX-License-Identifier: MIT
// An example of a consumer contract that directly pays for each request.
pragma solidity 0.8.24;

import {IRandomProducer} from "./interfaces/IRandomProducer.sol";
import {IAccessManager} from "@openzeppelin/contracts/access/manager/IAccessManager.sol";
import {AccessManaged} from "@openzeppelin/contracts/access/manager/AccessManaged.sol";
import {GelatoVRFConsumerBase} from "./vendor/GelatoVRFConsumerBase.sol";

/**
 * @title RandomProducerGelatoVRF
 * @notice A contract that produce random words through the Gelato VRF service via subscription.
 * @custom:security-contact dev@deelit.net
 */
contract RandomProducerGelatoVRF is IRandomProducer, GelatoVRFConsumerBase, AccessManaged {
    event RequestSent(uint256 requestId);
    event RequestFulfilled(uint256 requestId, uint256 randomWords);

    struct RequestStatus {
        bool fulfilled; // whether the request has been successfully fulfilled
        bool exists; // whether a requestId exists
        uint256 randomWord; // the random words generated by the request
    }
    mapping(uint256 => RequestStatus) public _requests; /* requestId --> requestStatus */

    // past requests Id.
    uint256[] public _requestIds;
    uint256 public _lastRequestId;

    address _gelatoOperator;

    constructor(IAccessManager manager_, address gelatoOperator_) AccessManaged(address(manager_)) {
        _gelatoOperator = gelatoOperator_;
    }

    function requestRandomWord() external restricted returns (uint256 requestId) {
        requestId = _requestRandomness("");
        _requestIds.push(requestId);
        _requests[requestId] = RequestStatus({randomWord: 0, exists: true, fulfilled: false});
        _lastRequestId = requestId;
        emit RequestSent(requestId);
        return requestId;
    }

    function _fulfillRandomness(uint256 randomness, uint256 requestId, bytes memory) internal override {
        require(_requests[requestId].exists, "RandomProducerGelatoVRF: request not found");
        _requests[requestId].fulfilled = true;
        _requests[requestId].randomWord = randomness;
        emit RequestFulfilled(requestId, randomness);
    }

    function getRequestStatus(uint256 _requestId) external view returns (bool fulfilled, uint256 randomWord) {
        require(_requests[_requestId].exists, "RandomProducerGelatoVRF: request not found");
        RequestStatus memory request = _requests[_requestId];
        return (request.fulfilled, request.randomWord);
    }

    function setOperator(address operator_) external restricted {
        _gelatoOperator = operator_;
    }

    function Operator() external view returns (address) {
        return _gelatoOperator;
    }

    function _operator() internal view virtual override returns (address) {
        return _gelatoOperator;
    }
}
