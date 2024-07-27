// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

library LibEIP712 {
    bytes32 private constant TYPE_HASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

    struct EIP712Domain {
        string name;
        string version;
        uint256 chainId;
        address verifyingContract;
    }

    function buildDomainSeparator(EIP712Domain memory domain) internal pure returns (bytes32) {
        return keccak256(abi.encode(TYPE_HASH, keccak256(bytes(domain.name)), keccak256(bytes(domain.version)), domain.chainId, domain.verifyingContract));
    }

    function hashTypedDataV4(bytes32 domainSeparator, bytes32 structHash) internal pure returns (bytes32) {
        return MessageHashUtils.toTypedDataHash(domainSeparator, structHash);
    }
}
