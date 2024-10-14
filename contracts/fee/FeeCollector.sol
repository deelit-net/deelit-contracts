// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {LibFee} from "../libraries/LibFee.sol";

/// @title FeeDispatcher contract
/// @author d0x4545lit
/// @notice Contract to dispatch fees to the fee collector
/// @custom:security-contact dev@deelit.net
abstract contract FeeCollector is Initializable {
    using SafeERC20 for IERC20;
    using Address for address payable;

    /// @custom:storage-location erc7201:deelit.storage.FeeCollector
    struct FeeCollectorStorage {
        LibFee.Fee fees;
    }

    // keccak256(abi.encode(uint256(keccak256("deelit.storage.FeeCollector")) - 1)) & ~bytes32(uint256(0xff));
    bytes32 private constant FeeCollectorStorageLocation = 0xf04b05ec709d0e7bacc48c9b6c8f35760351735fb17207656e66e54186b51400;

    /// @dev Internal function to get the storage
    function _getFeeCollectorStorage() private pure returns (FeeCollectorStorage storage $) {
        assembly {
            $.slot := FeeCollectorStorageLocation
        }
    }

    /// @dev Contract initializer
    /// @param fees the fees details
    function __FeeCollector_init(LibFee.Fee calldata fees) internal onlyInitializing {
        __FeeCollector_init_unchained(fees);
    }

    /// @dev Contract initializer unchained
    /// @param fees the fees details
    function __FeeCollector_init_unchained(LibFee.Fee calldata fees) internal onlyInitializing {
        _setFees(fees);
    }

    /// @dev Get the fees details
    function getFees() external view returns (LibFee.Fee memory) {
        return _getFees();
    }

    /// @dev Internal function to get the fees details
    function _getFees() internal view returns (LibFee.Fee storage) {
        FeeCollectorStorage storage $ = _getFeeCollectorStorage();
        return $.fees;
    }

    /// @dev Internal function to set the fees details
    /// Inheriting contracts should use this function to set the fees
    function _setFees(LibFee.Fee calldata fees) internal {
        require(fees.amount_bp < 10000, "FeeCollector: invalid fee percentage");
        FeeCollectorStorage storage $ = _getFeeCollectorStorage();
        $.fees = fees;
    }

    /// @dev Internal function to collect the fee
    /// The fee is sent to the recipient defined in the fees details
    /// @param feeAmount the fee amount to collect
    function _collectFee(uint256 feeAmount) internal {
        _collectFee(_getFees().recipient, feeAmount);
    }

    /// @dev Internal function to collect the fee
    /// @param recipient the recipient of the fee
    /// @param feeAmount the fee amount to collect
    function _collectFee(address recipient, uint256 feeAmount) internal {
        payable(recipient).sendValue(feeAmount);
    }

    /// @dev Internal function to collect the fee in ERC20
    /// The fee is sent to the recipient defined in the fees details
    /// @param token the token to collect the fee in
    /// @param feeAmount the fee amount to collect
    function _collectFeeErc20(IERC20 token, uint256 feeAmount) internal {
        _collectFeeErc20(token, _getFees().recipient, feeAmount);
    }

    /// @dev Internal function to collect the fee in ERC20
    /// @param token the token to collect the fee in
    /// @param recipient the recipient of the fee
    /// @param feeAmount the fee amount to collect
    function _collectFeeErc20(IERC20 token, address recipient, uint256 feeAmount) internal {
        token.safeTransfer(recipient, feeAmount);
    }

    /// @dev Internal function to collect the fee in ERC20 from a specific address
    /// The fee is sent to the recipient defined in the fees details
    /// @param token the token to collect the fee in
    /// @param from the address to collect the fee from
    /// @param feeAmount the fee amount to collect
    function _collectFeeErc20From(IERC20 token, address from, uint256 feeAmount) internal {
        _collectFeeErc20From(token, from, _getFees().recipient, feeAmount);
    }

    /// @dev Internal function to collect the fee in ERC20 from a specific address
    /// @param token the token to collect the fee in
    /// @param from the address to collect the fee from
    /// @param recipient the recipient of the fee
    /// @param feeAmount the fee amount to collect
    function _collectFeeErc20From(IERC20 token, address from, address recipient, uint256 feeAmount) internal {
        token.safeTransferFrom(from, recipient, feeAmount);
    }
}
