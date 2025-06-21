require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.20",
  networks: {
    goerli: {
      url: "https://goerli.infura.io/v3/YOUR_INFURA_KEY", // or Alchemy
      accounts: ["YOUR_PRIVATE_KEY"]
    },
    // For local: npx hardhat node
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  }
};