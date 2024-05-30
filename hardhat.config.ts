import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@openzeppelin/hardhat-upgrades';
import "@nomicfoundation/hardhat-verify";
import 'solidity-docgen';
// import "hardhat-gas-reporter"

const SEPOLIA_ALCHEMY_API_KEY = vars.get("SEPOLIA_ALCHEMY_API_KEY");
const SEPOLIA_ETHSCAN_API_KEY = vars.get("SEPOLIA_ETHSCAN_API_KEY");
const SEPOLIA_PRIVATE_KEY = vars.get("SEPOLIA_PRIVATE_KEY");

const BASE_SEPOLIA_ALCHEMY_API_KEY = vars.get("BASE_SEPOLIA_ALCHEMY_API_KEY");
const BASE_SEPOLIA_ETHSCAN_API_KEY = vars.get("BASE_SEPOLIA_ETHSCAN_API_KEY");
const BASE_SEPOLIA_PRIVATE_KEY = vars.get("BASE_SEPOLIA_PRIVATE_KEY");


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
  etherscan: {
    apiKey: {
      sepolia: SEPOLIA_ETHSCAN_API_KEY,
      baseSepolia: BASE_SEPOLIA_ETHSCAN_API_KEY
    },
  },
  networks: { 
    hardhat: {
      chainId: 1337
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${SEPOLIA_ALCHEMY_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY]
    },
    baseSepolia: {
      url: `https://base-sepolia.g.alchemy.com/v2/${BASE_SEPOLIA_ALCHEMY_API_KEY}`,
      accounts: [BASE_SEPOLIA_PRIVATE_KEY]
    }
  }
};

export default config;
