const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);

  // 1. Deploy Token
  const Token = await hre.ethers.getContractFactory("SkillBridgeToken");
  const token = await Token.deploy(deployer.address); // Already deployed
  console.log("SkillBridgeToken deployed to:", token.target);

  // 2. Deploy NFT
  const NFT = await hre.ethers.getContractFactory("SkillBridgeNFT");
  const nft = await NFT.deploy(deployer.address); // Already deployed
  console.log("SkillBridgeNFT deployed to:", nft.target);

  // 3. Deploy Main SkillBridge Contract
  const SkillBridge = await hre.ethers.getContractFactory("SkillBridge");
  const mainContract = await SkillBridge.deploy(token.target, nft.target);
  console.log("SkillBridge Main Contract deployed to:", mainContract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

/*Deploying contracts with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
SkillBridgeToken deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
SkillBridgeNFT deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
SkillBridge Main Contract deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
*/