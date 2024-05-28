import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@openzeppelin/hardhat-upgrades';

import 'solidity-docgen';
// import "hardhat-gas-reporter"

const SEPOLIA_ALCHEMY_API_KEY = vars.get("SEPOLIA_ALCHEMY_API_KEY");
const SEPOLIA_PRIVATE_KEY = vars.get("SEPOLIA_PRIVATE_KEY");

const BASE_SEPOLIA_ALCHEMY_API_KEY = vars.get("BASE_SEPOLIA_ALCHEMY_API_KEY");
const BASE_SEPOLIA_PRIVATE_KEY = vars.get("BASE_SEPOLIA_PRIVATE_KEY");

// const ARBITRUIM_ALCHEMY_API_KEY = vars.get("ARBITRUIM_ALCHEMY_API_KEY");
// const ARBITRUIM_SEPOLIA_PRIVATE_KEY = vars.get("ARBITRUIM_SEPOLIA_PRIVATE_KEY");

// const OP_SEPOLIA_ALCHEMY_API_KEY = vars.get("OP_SEPOLIA_ALCHEMY_API_KEY");
// const OP_SEPOLIA_PRIVATE_KEY = vars.get("OP_SEPOLIA_PRIVATE_KEY");

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      }
    }
  },
  docgen: {
    outputDir: './docs',
  },
  networks: { 
    hardhat: {
      chainId: 1337
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${SEPOLIA_ALCHEMY_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY]
    },
    base_sepolia: {
      url: `https://base-sepolia.g.alchemy.com/v2/${BASE_SEPOLIA_ALCHEMY_API_KEY}`,
      accounts: [BASE_SEPOLIA_PRIVATE_KEY]
    }
  }
};

export default config;
