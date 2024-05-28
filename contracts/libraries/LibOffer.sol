// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/math/Math.sol";

library LibOffer {
    using Math for uint;

    bytes32 constant OFFER_TYPEHASH =
        keccak256(
            "Offer(address from_address,bytes32 product_hash,uint256 price,string currency_code,uint256 chain_id,address token_address,uint8 shipment_type,uint256 shipment_price,uint256 expiration_time)"
        );

    struct Offer {
        address from_address; // address of the offer creator
        bytes32 product_hash; // hash of the product
        uint256 price; // price of the offer in the currency (not including shipment price)
        string currency_code; // currency code for the payment
        uint256 chain_id; // chain id for the payment
        address token_address; // address(0) for native currency
        uint8 shipment_type; // shipment type (0: no shipment, 1: national, 2: regianal, 3: international)
        uint256 shipment_price; // price of the shipment in the currency
        uint256 expiration_time; // expiration time of the offer
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
                    offer_.shipment_type,
                    offer_.shipment_price,
                    offer_.expiration_time
                )
            );
    }

    function calculateTotalPrice(Offer memory offer_) internal pure returns (uint256) {
        (bool success, uint256 total) = offer_.price.tryAdd(offer_.shipment_price);
        assert(success);
        return total;
    }
}
