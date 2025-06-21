// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenSwap {
    address public immutable token;  // SAGE token address (ERC20)
    address public immutable owner;  // Deployer address
    uint public rate = 100;          // 1 ETH = 100 SAGE

    constructor(address _token) {
        token = _token;
        owner = msg.sender;
    }

    /// @notice Buy SAGE tokens by sending ETH
    function buyTokens() public payable {
        require(msg.value > 0, "Send ETH to buy tokens");

        uint tokenAmount = msg.value * rate;
        require(IERC20(token).balanceOf(address(this)) >= tokenAmount, "Insufficient SAGE in contract");

        bool success = IERC20(token).transfer(msg.sender, tokenAmount);
        require(success, "Token transfer failed");
    }

    /// @notice Sell SAGE tokens and receive ETH
    function sellTokens(uint tokenAmount) public {
        require(tokenAmount > 0, "Specify token amount");

        uint etherAmount = tokenAmount / rate;
        require(address(this).balance >= etherAmount, "Insufficient ETH in contract");

        bool success1 = IERC20(token).transferFrom(msg.sender, address(this), tokenAmount);
        require(success1, "Token transferFrom failed");

        (bool success2, ) = payable(msg.sender).call{value: etherAmount}("");
        require(success2, "ETH transfer failed");
    }

    /// @notice Owner can withdraw ETH from contract
    function withdraw() external {
        require(msg.sender == owner, "Only owner can withdraw");
        (bool success, ) = payable(owner).call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }

    /// @notice Accept ETH transfers directly
    receive() external payable {}
}
