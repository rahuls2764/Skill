// contracts/scripts/deploy-main.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const tokenAddress = "0x290A3F3b61dF4508ACAc89D1B39a2a2d52Ac58e2"; // 🔁 Replace with actual SkillBridgeToken address
  const nftAddress = "0x69A1135c3992b9F23A58d4f1dCe013C85B0612b4";   // 🔁 Replace with actual SkillBridgeNFT address

  const Main = await ethers.getContractFactory("SkillBridgeMain");

  const mainContract = await Main.deploy(tokenAddress, nftAddress, deployer.address); // Pass owner
  await mainContract.waitForDeployment();

  console.log("✅ SkillBridgeMain deployed to:", await mainContract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
