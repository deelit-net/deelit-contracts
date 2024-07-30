import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@openzeppelin/hardhat-upgrades';
import '@openzeppelin/defender-sdk';
import "@nomicfoundation/hardhat-verify";
import 'solidity-docgen';

const DEFENDER_API_KEY = vars.get("DEFENDER_API_KEY");
const DEFENDER_API_SECRET = vars.get("DEFENDER_API_SECRET");

const ALCHEMY_API_KEY = vars.get("ALCHEMY_API_KEY");

const SEPOLIA_ETHSCAN_API_KEY = vars.get("SEPOLIA_ETHSCAN_API_KEY");
const SEPOLIA_PRIVATE_KEY = vars.get("SEPOLIA_PRIVATE_KEY");

const BASE_SEPOLIA_ETHSCAN_API_KEY = vars.get("BASE_SEPOLIA_ETHSCAN_API_KEY");
const BASE_SEPOLIA_PRIVATE_KEY = vars.get("BASE_SEPOLIA_PRIVATE_KEY");

const OPTIMISM_SEPOLIA_ETHSCAN_API_KEY = vars.get("OPTIMISM_SEPOLIA_ETHSCAN_API_KEY");
const OPTIMISM_SEPOLIA_PRIVATE_KEY = vars.get("OPTIMISM_SEPOLIA_PRIVATE_KEY");


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
  defender: {
    apiKey: DEFENDER_API_KEY,
    apiSecret: DEFENDER_API_SECRET,
    useDefenderDeploy: false,
  },  
  etherscan: {
    apiKey: {
      sepolia: SEPOLIA_ETHSCAN_API_KEY,
      baseSepolia: BASE_SEPOLIA_ETHSCAN_API_KEY,
      optimismSepolia: OPTIMISM_SEPOLIA_ETHSCAN_API_KEY
    },
    customChains: [
      {
        network: "optimismSepolia",
        chainId: 11155420,
        urls: {
          apiURL: "https://api-sepolia-optimistic.etherscan.io/api",
          browserURL: "https://sepolia-optimism.etherscan.io/"
        }
      }
    ],
  },
  networks: { 
    hardhat: {
      chainId: 1337
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY]
    },
    baseSepolia: {
      url: `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [BASE_SEPOLIA_PRIVATE_KEY]
    },
    optimismSepolia: {
      url: `https://opt-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [OPTIMISM_SEPOLIA_PRIVATE_KEY]
    }
  }
};

export default config;
