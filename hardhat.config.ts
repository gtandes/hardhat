import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@openzeppelin/hardhat-upgrades";
// require("@nomiclabs/hardhat-ethers"); //from possibly deprecated docs
// require('@openzeppelin/hardhat-upgrades');
// require("@nomicfoundation/hardhat-toolbox-viem");

const config: HardhatUserConfig = {
  // const config = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // Lower runs value to optimize for deployment size
      },
    },
  },
};

// module.exports = config;
export default config;
