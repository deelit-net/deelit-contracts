// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IRandomProducer} from "./interfaces/IRandomProducer.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/// @custom:security-contact dev@deelit.net
abstract contract RandomConsumer is Initializable {


    /// @custom:storage-location erc7201:deelit.storage.RandomConsumer
    struct RandomConsumerStorage {
        IRandomProducer randomProducer;
    }

    // keccak256(abi.encode(uint256(keccak256("deelit.storage.RandomConsumer")) - 1)) & ~bytes32(uint256(0xff));
    bytes32 private constant RandomConsumerStorageLocation = 0x50558d26733d325560c2fe20436728060efc1ecce5928841c4d7cfca03dd6e00;

    function _getRandomConsumerStorage() private pure returns (RandomConsumerStorage storage $) {
        assembly {
            $.slot := RandomConsumerStorageLocation
        }
    }

    /**
     * @dev Initializes the contract connected to an initial authority.
     */
    function __RandomConsumer_init(IRandomProducer randomProducer) internal onlyInitializing {
        __RandomConsumer_init_unchained(randomProducer);
    }

    function __RandomConsumer_init_unchained(IRandomProducer randomProducer) internal onlyInitializing {
        _setRandomProducer(randomProducer);
    }

    function getRandomProducer() public view returns (IRandomProducer) {
        return _getRandomProducer();
    }

    function _getRandomProducer() private view returns (IRandomProducer) {
        RandomConsumerStorage storage $ = _getRandomConsumerStorage();
        return $.randomProducer;
    }
    function _setRandomProducer(IRandomProducer randomProducer) internal {
        require(address(randomProducer) != address(0), "RandomConsumerBase: randomProducer is zero address");
        RandomConsumerStorage storage $ = _getRandomConsumerStorage();
        $.randomProducer = randomProducer;
    }

    function _checkRandomProducer() internal view {
        require(address(_getRandomProducer()) != address(0), "RandomConsumerBase: randomProducer not set");
    }

    function _requestRandomNumber() internal returns (uint256) {
        _checkRandomProducer();
        
        return _getRandomProducer().requestRandomWord();
    }

    function _getRequestStatus(uint256 _requestId) internal view returns (bool fulfilled, uint256 randomWord) {
        _checkRandomProducer();
        return _getRandomProducer().getRequestStatus(_requestId);
    }
}
