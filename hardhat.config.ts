import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@openzeppelin/hardhat-upgrades';
import '@openzeppelin/defender-sdk';
import "@nomicfoundation/hardhat-verify";
import 'solidity-docgen';

const DEFENDER_API_KEY = vars.get("DEFENDER_API_KEY");
const DEFENDER_API_SECRET = vars.get("DEFENDER_API_SECRET");

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
  defender: {
    apiKey: DEFENDER_API_KEY,
    apiSecret: DEFENDER_API_SECRET,
    useDefenderDeploy: false,
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
