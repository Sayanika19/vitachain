const hre = require("hardhat");

async function main() {
  // Deploy SageToken
  const SageToken = await hre.ethers.getContractFactory("SageToken");
  const sageToken = await SageToken.deploy(1000000); // 1,000,000 initial supply
  await sageToken.waitForDeployment();
  console.log("SageToken deployed to:", await sageToken.getAddress());

  // Deploy TokenSwap
  const TokenSwap = await hre.ethers.getContractFactory("TokenSwap");
  const tokenSwap = await TokenSwap.deploy(await sageToken.getAddress());
  await tokenSwap.waitForDeployment();
  console.log("TokenSwap deployed to:", await tokenSwap.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});