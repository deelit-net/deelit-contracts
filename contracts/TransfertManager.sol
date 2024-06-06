// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./libraries/LibTransaction.sol";
import "./libraries/LibFee.sol";
import "./libraries/LibBytes.sol";
import "./libraries/LibVerdict.sol";

/// @custom:security-contact dev@deelit.net
abstract contract TransfertManager is OwnableUpgradeable {
    using Math for uint;
    using SafeERC20 for IERC20;
    using Address for address payable;
    using LibBytes for bytes;

    LibFee.Fee public fees;

    function __TransfertManager_init(LibFee.Fee calldata fees_) internal onlyInitializing {
        __TransfertManager_init_unchained(fees_);
    }

    function __TransfertManager_init_unchained(LibFee.Fee calldata fees_) internal onlyInitializing {
        _setFees(fees_);
    }

    /// @dev allow the contract to receive native currency
    receive() external payable {}

    /// @dev Set the fees for the protocol.
    /// @param fees_ the fees to set. see LibFee.Fee struct.
    function _setFees(LibFee.Fee calldata fees_) internal {
        require(address(fees_.collector) != address(0), "TransfertManager: invalid fee collector");
        require(fees_.amount_bp < 10000, "TransfertManager: invalid fee percentage");
        fees = fees_;
    }

    /// @dev Process to the payment of an offer. The payment is stored by the contract.
    /// @param tx_ the payment and offer details
    function _doPay(LibTransaction.Transaction calldata tx_) internal {
        // compute amount to pay regarding the fees
        uint256 amount = LibOffer.calculateTotalPrice(tx_.offer);
        uint256 feeAmount = LibFee.calculateFees(amount, fees);

        if (tx_.offer.token_address == address(0)) {
            _doPayNative(amount, feeAmount);
        } else {
            _doPayErc20(tx_.offer.token_address, amount, feeAmount);
        }
    }

    /// @dev Process to the payment of an offer in native currency. The payment is stored by the contract.
    /// @param amount_ the amount to pay
    /// @param feeAmount_ the fee amount to pay
    function _doPayNative(uint256 amount_, uint256 feeAmount_) private {
        (bool success, uint256 amountWithFee) = amount_.tryAdd(feeAmount_);
        assert(success);

        // native currency payment
        require(msg.value >= amountWithFee, "TransfertManager: not enough value");

        // transfer the fee amount to the contract
        fees.collector.collect{value: feeAmount_}();

        // refund the excess
        uint256 rest = msg.value - amountWithFee;
        if (rest > 0) {
            payable(msg.sender).sendValue(rest);
        }
    }

    /// @dev Process to the payment of an offer in ERC20. The payment is stored by the contract.
    /// @param token_ the token address
    /// @param amount_ the amount to pay
    /// @param feeAmount_ the fee amount to pay
    function _doPayErc20(address token_, uint256 amount_, uint256 feeAmount_) private {
        // ERC20 payment
        IERC20 token = IERC20(token_);

        // verify allowance
        uint256 allowance = token.allowance(msg.sender, address(this));
        require(allowance >= amount_ + feeAmount_, "TransfertManager: allowance too low");

        // process the payment
        token.safeTransferFrom(msg.sender, address(fees.collector), feeAmount_);
        token.safeTransferFrom(msg.sender, address(this), amount_);
    }

    /// @dev Procces to the claim of a payment. The payment is released to the payee.
    /// @param tx_ the payment and offer details
    function _doClaim(LibTransaction.Transaction calldata tx_) internal {
        // compute amount to claim regarding the fees
        uint256 amount = LibOffer.calculateTotalPrice(tx_.offer);
        address payable payee = payable(tx_.payment.destination_address.toAddress());

        if (tx_.offer.token_address == address(0)) {
            // native currency payment
            payee.sendValue(amount);
        } else {
            // ERC20 payment
            IERC20 token = IERC20(tx_.offer.token_address);
            token.safeTransfer(payee, amount);
        }
    }

    /// @dev Process to the resolution of a conflict. The payment is splitted regarding verdict 'payer_amount' and 'payee_amount'.
    /// @param tx_ the payment and offer details
    /// @param verdict_ the verdict details
    function _doResolve(LibTransaction.Transaction calldata tx_, LibVerdict.Verdict calldata verdict_) internal {
        // check the verdict amount
        uint256 amount = LibOffer.calculateTotalPrice(tx_.offer);
        (uint256 payerAmount, uint256 payeeAmount) = LibVerdict.calculateAmounts(amount, verdict_);

        // define payee and payer
        address payable payee = payable(tx_.payment.destination_address.toAddress());
        address payable payer = payable(tx_.offer.from_address);

        // transfer the amounts
        if (tx_.offer.token_address == address(0)) {
            // native currency payment
            payee.sendValue(payerAmount);
            payer.sendValue(payeeAmount);
        } else {
            // ERC20 payment
            IERC20 token = IERC20(tx_.offer.token_address);
            token.safeTransfer(payee, payerAmount);
            token.safeTransfer(payer, payeeAmount);
        }
    }
}
