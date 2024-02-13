// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./ERC20.sol";

contract PrivateToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("PrivateToken", "PRT") {
        _mint(msg.sender, initialSupply);
    }

    function balanceOf(address account) public view override returns (uint256) {
        require(account == msg.sender, "PrivateToken: balance query for non-owner");
        return super.balanceOf(account);
    }
}
