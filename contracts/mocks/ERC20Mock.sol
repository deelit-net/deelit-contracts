// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC20Mock is ERC20, Ownable {
    constructor() ERC20("Mock", "MOC") Ownable(msg.sender) {
        _mint(msg.sender, 100 * 10 ** decimals());
    }
}
