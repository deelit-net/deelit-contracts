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

    function _getFeeCollectorStorage() private pure returns (FeeCollectorStorage storage $) {
        assembly {
            $.slot := FeeCollectorStorageLocation
        }
    }
    
    function __FeeCollector_init(LibFee.Fee calldata fees) internal onlyInitializing {
        __FeeCollector_init_unchained(fees);
    }

    function __FeeCollector_init_unchained(LibFee.Fee calldata fees) internal onlyInitializing {
        _setFees(fees);
    }

    function getFees() external view returns (LibFee.Fee memory) {
        return _getFees();
    }

    function _getFees() internal view returns (LibFee.Fee storage) {
        FeeCollectorStorage storage $ = _getFeeCollectorStorage();
        return $.fees;
    }

    function _setFees(LibFee.Fee calldata fees) internal {
        require(fees.amount_bp < 10000, "FeeCollector: invalid fee percentage");
        FeeCollectorStorage storage $ = _getFeeCollectorStorage();
        $.fees = fees;
    }

    function _collectFee(uint256 fee) internal {
        _collectFee(_getFees().recipient, fee);
    }

    function _collectFee(address recipient, uint256 fee) internal {
        payable(recipient).sendValue(fee);
    }

    function _collectFeeErc20(IERC20 token, address from, uint256 fee) internal {
        _collectFeeErc20(token, from, _getFees().recipient, fee);
    }

    function _collectFeeErc20(IERC20 token, address from, address recipient, uint256 fee) internal {
        token.safeTransferFrom(from, recipient, fee);
    }

}