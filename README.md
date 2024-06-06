# Deelit Protocol Smart Contracts

This is the official repository for the Deelit Protocol smart contracts.

## Description

The Deelit Protocol is a decentralized platform built on the Ethereum blockchain. It leverages smart contracts to facilitate secure, trustless transactions between users. This repository contains the Solidity smart contracts that power the Deelit Protocol. To learn more about DEELIT, you can explore our [learing plateform][1]

The main contract, `DeelitProtocol.sol`, manages the core logic of the protocol. It handles operations such as initiating transactions, resolving disputes, and distributing funds. The contract ensures that all transactions are secure and adhere to the rules of the protocol.

These contracts are NOT production ready and still need some testing and auditing.

## Installation

To install the necessary dependencies, run the following command:

```bash
pnpm install
```

## Running test

To run the unit tests, use the following command:

```bash
pnpm run test
```

To generate code coverage, use the following command:

```bash
pnpm run coverage
```

To generate gas report, use the following command:

```bash
pnpm run gas
```

## Security Analysis with Mythril
We use Mythril for security analysis of our smart contracts. To run Mythril on the Deelit Protocol contracts, follow these steps:

Install Mythril using the instructions [here][2].
To run mythril analysis, run the following command:

```bash
myth analyze contract/DeelitProtocol.sol --solc-json remapping.json
```

Using docker image
```bash
docker run -v $(pwd):/tmp mythril/myth analyze /tmp/contracts/DeelitProtocol.sol --solc-json remapping.json
```

[1]: https://learn.deelit.net "Deelit Learning Platform"
[2]: https://mythril-classic.readthedocs.io/en/master/installation.html "Mythril"



# Deployment proxies

## Mainet

| Network | DeelitProtocol | FeeCollector |
|---|---|---|
| Ethereum |  |  |
| Base |  |  |
| OP |  |  |
| Arbitrium |  |  |
| Binance Smart Chain |  |  |

## Testnet

| Network | DeelitProtocol | FeeCollector |
|---|---|---|
| Sepolia | [0xf189f0fB4EDba8b5d039032758F85411dfb883A0](https://sepolia.etherscan.io/address/0xf189f0fB4EDba8b5d039032758F85411dfb883A0) | [0x11E133f8CFA43bdF03Ff406dAfc82B3D49493783](https://sepolia.etherscan.io/address/0x11E133f8CFA43bdF03Ff406dAfc82B3D49493783) |
| Base Sepolia | [0x33e0758300F1f16c2A31C4c077354B968E8F7d7F](https://sepolia.basescan.org/address/0x33e0758300F1f16c2A31C4c077354B968E8F7d7F) | [0x3192a82B96E16302Dc11359a4dAE64a1C05a1c0B](https://sepolia.basescan.org/address/0x3192a82b96e16302dc11359a4dae64a1c05a1c0b) |
| OP Sepolia |  |  |
| Arbitrium Sepolia |  |  |
| Binance Smart Chain Testnet |  |  |

