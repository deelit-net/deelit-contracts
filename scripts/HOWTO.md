# How to deploy the protocol

1. deploy access manager

```
INITIAL_ADMIN_ADDRESS=0xADMIN npx hardhat run --network xxxx scripts/access/deploy-access-manager.ts

pnpm hardhat verify --network xxxx 0xMANAGER
```

2. deploy fee recipient

```
ACCESS_MANAGER_ADDRESS=0xMANAGER npx hardhat run --network xxxx scripts/fee/deploy-fee-recipient.ts

pnpm hardhat verify --network xxxx 0xFEE
```

3. deploy protocol

```
ACCESS_MANAGER_ADDRESS=0xMANAGER FEE_RECIPIENT_ADDRESS=0xDEE FEE_AMOUNT=100 npx hardhat run --network xxxx scripts/protocol/deploy-deelit-protocol.ts

pnpm hardhat verify --network xxxx 0xPROTOCOL
```

4. deploy random producer

a. Chainlink VRF producer

- Create a VRF subsciption on the related network at https://vrf.chain.link/
- Retreive the subscription ID
- Find the coordinator address and gas line key hash at https://docs.chain.link/vrf/v2-5/supported-networks#polygon-matic-mainnet

```
ACCESS_MANAGER_ADDRESS=0xMANAGER COORDINATOR_ADDRESS=0xCOORDINATOR SUBSCRIPTION_ID=SUB_ID GAS_LANE_KEY_HASH=0xGASLINE CALLBACK_GAS_LIMIT=100000 REQUEST_CONFIRMATIONS=3 npx hardhat run --network xxxx scripts/random/deploy-random-producer-chainlink-vrf-v25.ts

pnpm hardhat verify --network xxxx 0xRANDOM --constructor-args args.js
```

b. gelato random producer

- Create a VRF task on the related network at https://app.gelato.network/
- Retreive the "Dedicated message sender"

```
ACCESS_MANAGER_ADDRESS=0xMANAGER GELATO_OPERATO_ADDRESS=0x0000000000000000000000000000000000000000 npx hardhat run --network baseSepolia scripts/random/deploy-random-producer-gelato-vrf.ts

pnpm hardhat verify --network xxxx 0xRANDOM 0xMANAGER 0x0000000000000000000000000000000000000000
```

5. deploy lottery

```
ACCESS_MANAGER_ADDRESS=0xMANAGER PROTOCOL_ADDRESS=0xPROTOCOL RANDOM_PRODUCER_ADDRESS=0xRANDOM FEE_RECIPIENT_ADDRESS=0xFEE FEE_AMOUNT=400 npx hardhat run --network xxxx scripts/lottery/deploy-lottery.ts

pnpm hardhat verify --network xxxx 0xLOTTERY
```

6. setup roles

```
ACCESS_MANAGER_ADDRESS=0xMANAGER RANDOM_PRODUCER_ADDRESS=0xRANDOM npx hardhat run --network xxxx scripts/access/setup-random-producer-roles.ts

ACCESS_MANAGER_ADDRESS=0xMANAGER LOTTERY_ADDRESS=0xLOTTERY npx hardhat run --network xxxx scripts/access/setup-lottery-roles.ts

ACCESS_MANAGER_ADDRESS=0xMANAGER PROTOCOL_ADDRESS=0xPROTOCOL npx hardhat run --network xxxx scripts/access/setup-protocol-roles.ts
```

7. deploy governance

```
ACCESS_MANAGER_ADDRESS=0xMANAGER npx hardhat run --network base scripts/deeao/deploy-token.ts

pnpm hardhat verify --network xxxx 0xTOKEN

ACCESS_MANAGER_ADDRESS=0xMANAGER TOKEN_ADDRESS=0xTOKEN BASE_DELAY_SECONDS=86400 npx hardhat run --network xxxx scripts/deeao/deploy-governance.ts

pnpm hardhat verify --network xxxx 0xGOV

```
