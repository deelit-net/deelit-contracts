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

## Mainnet

| Network | DeelitProtocol | Lottery | FeeRecipient | AccessManager | RandomProducer |
|---|---|---|---|---|---|
| Ethereum |  |  |  |  |  |
| Base |  |  |  |  |  |
| OP |  |  |  |  |  |
| Arbitrium |  |  |  |  |  |
| Binance Smart Chain |  |  |  |  |  |

## Testnet

| Network | DeelitProtocol | Lottery | FeeRecipient | AccessManager | RandomProducer |
|---|---|---|---|---|---|
| Sepolia | [0x3b504CEBf11E428dc5c7d206a78Af1Be9D760c25](https://sepolia.etherscan.io/address/0x3b504CEBf11E428dc5c7d206a78Af1Be9D760c25) | [0xAC4585149DC3A0B0e1BED74aE1d7abB4c6c202cF](https://sepolia.etherscan.io/address/0xAC4585149DC3A0B0e1BED74aE1d7abB4c6c202cF) | [0x6D42CCBD3de554B8C0e10F0d29335636E22a7EDE](https://sepolia.etherscan.io/address/0x6D42CCBD3de554B8C0e10F0d29335636E22a7EDE) | [0xAAfb15E31d9ad1be145f7CF169B1b5DdD10680e6](https://sepolia.etherscan.io/address/0xAAfb15E31d9ad1be145f7CF169B1b5DdD10680e6) | [0xf3fAbE8145bB87Dc366880605c8Db23b0E7bE231](https://sepolia.etherscan.io/address/0xf3fAbE8145bB87Dc366880605c8Db23b0E7bE231) |
| Base Sepolia | [0xA4f8E7233d347F5433b3A48848Ca3cB2CbA5B158](https://sepolia.basescan.org/address/0xA4f8E7233d347F5433b3A48848Ca3cB2CbA5B158) | [0xe9691132fE4d650251dde2B6dEec9cdc043ff6d5](https://sepolia.basescan.org/address/0x79dC9B2a02c6c403188172848A0310bfC1a90E9B) | [0xC22421d305CB2a3F40c5A163a916Ad432612535C](https://sepolia.basescan.org/address/0xC22421d305CB2a3F40c5A163a916Ad432612535C) | [0x75359d1b02731c15FAD3929D5476C40ED3EB3F62](https://sepolia.basescan.org/address/0x75359d1b02731c15FAD3929D5476C40ED3EB3F62) | [0xfb27351fF37d67BAD43589e769Ba457b166375fB](https://sepolia.basescan.org/address/0xfb27351fF37d67BAD43589e769Ba457b166375fB) |
| OP Sepolia | [0xDAD6383114E80439848555c1853bdEcfD3854815](https://sepolia-optimism.etherscan.io/address/0xDAD6383114E80439848555c1853bdEcfD3854815) |  | [0x4Ce5929aa1968e224C3C2d17c5d50F2928913b4A](https://sepolia-optimism.etherscan.io/address/0x4Ce5929aa1968e224C3C2d17c5d50F2928913b4A) | [0x9422Ad012B94db3e6B0702b4AD4Ad1BE5CC9366e](https://sepolia-optimism.etherscan.io/address/0x9422Ad012B94db3e6B0702b4AD4Ad1BE5CC9366e) |  |
| Arbitrium Sepolia |  |  |  |  |  |
| Binance Smart Chain Testnet |  |  |  |  |  |

