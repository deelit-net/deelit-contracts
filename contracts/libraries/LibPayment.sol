import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library LibPayment {
    bytes32 constant PAYMENT_TYPEHASH =
        keccak256("Payment(address from_address,bytes destination_address,bytes32 offer_hash,uint256 expiration_time,uint256 vesting_period)");

    /// @notice Payment structure
    /// @dev
    /// from_address: address of the payment requester
    /// destination_address: destination address of the payment address is not typed as it can be on any blockchain (not handled by this contract)
    /// offer_hash: hash of the offer
    /// expiration_time: expiration time to initiate the payment
    /// vesting_period: vesting period for the payment.
    ///   during this period the payment can be claimed by the destination address with an acceptance signature.
    ///   if the vesting period is over, the payment can be claimed without a signature if no conflict declared.
    struct Payment {
        address from_address;
        bytes destination_address;
        bytes32 offer_hash;
        uint256 expiration_time;
        uint256 vesting_period;
    }

    function hash(Payment memory payment) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    PAYMENT_TYPEHASH,
                    payment.from_address,
                    keccak256(payment.destination_address),
                    payment.offer_hash,
                    payment.expiration_time,
                    payment.vesting_period
                )
            );
    }
}
