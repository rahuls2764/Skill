// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Platform Token Contract
contract SkillBridgeToken is ERC20, Ownable {
    constructor(address initialOwner) ERC20("SkillBridge Token", "SBT") Ownable(initialOwner) {
        _mint(initialOwner, 10000000 * 10**decimals()); // 10M initial supply
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}