// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../libraries/LibOffer.sol";

contract LibOfferMock {
    function hash(LibOffer.Offer calldata offer_) external pure returns (bytes32) {
        return LibOffer.hash(offer_);
    }
}
