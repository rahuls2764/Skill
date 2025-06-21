// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Certificate NFT Contract
contract SkillBridgeNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId = 1;

    constructor(address initialOwner) ERC721("SkillBridge Certificate", "SBC") Ownable(initialOwner) {}

    function mintCertificate(address to, string memory tokenURI) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        return tokenId;
    }
}