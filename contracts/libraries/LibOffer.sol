// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

/// @custom:security-contact dev@deelit.net
library LibOffer {
    using Math for uint;

    bytes32 private constant OFFER_TYPEHASH =
        keccak256(
            "Offer(address from_address,bytes32 product_hash,uint256 price,string currency_code,uint256 chain_id,address token_address,bytes32 shipment_hash,uint256 shipment_price,uint256 expiration_time,uint256 salt)"
        );

    struct Offer {
        address from_address; // address of the offer creator
        bytes32 product_hash; // hash of the product details
        uint256 price; // price of the offer in the currency (not including shipment price)
        string currency_code; // currency code for the payment
        uint256 chain_id; // chain id for the payment
        address token_address; // address(0) for native currency
        bytes32 shipment_hash; // hash of the shipment details
        uint256 shipment_price; // price of the shipment in the currency
        uint256 expiration_time; // expiration time of the offer
        uint256 salt; // salt for the offer
    }

    function hash(Offer memory offer_) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    OFFER_TYPEHASH,
                    offer_.from_address,
                    offer_.product_hash,
                    offer_.price,
                    keccak256(bytes(offer_.currency_code)),
                    offer_.chain_id,
                    offer_.token_address,
                    offer_.shipment_hash,
                    offer_.shipment_price,
                    offer_.expiration_time,
                    offer_.salt
                )
            );
    }

    function calculateTotalPrice(Offer memory offer_) internal pure returns (uint256) {
        (bool success, uint256 total) = offer_.price.tryAdd(offer_.shipment_price);
        assert(success);
        return total;
    }
}
