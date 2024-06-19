// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {LibBp} from "./LibBp.sol";

/// @custom:security-contact dev@deelit.net
library LibVerdict {
    using LibBp for uint256;

    bytes32 private constant VERDICT_TYPEHASH = keccak256("Verdict(address from_address,bytes32 payment_hash,uint16 payer_bp,uint16 payee_bp)");

    struct Verdict {
        address from_address; // address of the verdict issuer
        bytes32 payment_hash; // hash of the payment
        uint16 payer_bp; // amount to refund for the buyer
        uint16 payee_bp; // amount to claim for the seller
    }

    function hash(Verdict memory verdict_) internal pure returns (bytes32) {
        return keccak256(abi.encode(VERDICT_TYPEHASH, verdict_.from_address, verdict_.payment_hash, verdict_.payer_bp, verdict_.payee_bp));
    }

    /// @dev Calculate the total amount of the verdict for the payer and the payee
    /// @param amount_ the total amount of the payment
    /// @param verdict_ the verdict details
    /// @return payerAmount the payer refund amount
    /// @return payeeAmount the payee claim amount
    function calculateAmounts(uint256 amount_, Verdict memory verdict_) internal pure returns (uint256, uint256) {
        uint256 bpSum = verdict_.payer_bp + verdict_.payee_bp;
        assert(bpSum >= verdict_.payer_bp); // overflow check

        require(bpSum == 10000, "LibVerdict: invalid bp sum");

        uint256 amount_payer = amount_.bp(verdict_.payer_bp);
        return (amount_payer, amount_ - amount_payer);
    }
}
