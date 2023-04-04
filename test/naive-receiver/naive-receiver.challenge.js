const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("[Challenge] Naive receiver", function () {
  let deployer, user, player;
  let pool, receiver;

  // Pool has 1000 ETH in balance
  const ETHER_IN_POOL = 1000n * 10n ** 18n;

  // Receiver has 10 ETH in balance
  const ETHER_IN_RECEIVER = 10n * 10n ** 18n;

  before(async function () {
    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
    [deployer, user, player] = await ethers.getSigners();

    const LenderPoolFactory = await ethers.getContractFactory(
      // Get contract factory of NaiveReceiverLenderPool as deployer
      "NaiveReceiverLenderPool",
      deployer
    );
    const FlashLoanReceiverFactory = await ethers.getContractFactory(
      // Get contract factory of FlashLoanReceiver as deployer
      "FlashLoanReceiver",
      deployer
    );

    pool = await LenderPoolFactory.deploy(); // Deploy NaiveReceiverLenderPool
    await deployer.sendTransaction({ to: pool.address, value: ETHER_IN_POOL }); // Deployer sends 1000 ETH to pool
    const ETH = await pool.ETH(); // Get ETH address from pool

    expect(await ethers.provider.getBalance(pool.address)).to.be.equal(
      ETHER_IN_POOL // ETH balance should == 1000 ETH (ETHER_IN_POOL)
    );
    expect(await pool.maxFlashLoan(ETH)).to.eq(ETHER_IN_POOL); // maxFlashLoan should == ETH balance (1000 ETH)
    expect(await pool.flashFee(ETH, 0)).to.eq(10n ** 18n); // Apparently 10n ** 18n == FIXED_FEE (1 ETHER)

    receiver = await FlashLoanReceiverFactory.deploy(pool.address); // Deploy flash loan receiver with NaiveReceiverLenderPool in constructor
    await deployer.sendTransaction({
      // Deployer sends 10 ETH to flash loan receiver
      to: receiver.address,
      value: ETHER_IN_RECEIVER,
    });
    await expect(
      receiver.onFlashLoan(
        deployer.address, // Deployer's address
        ETH, // ETH address
        ETHER_IN_RECEIVER, // 10 ETH
        10n ** 18n, // 1 ETH
        "0x" // Null data
      )
    ).to.be.reverted; // Expected to be reverted
    expect(await ethers.provider.getBalance(receiver.address)).to.eq(
      // Flash loan receiver balance to == 10 ETH
      ETHER_IN_RECEIVER
    );
  });

  it("Execution", async function () {
    /** CODE YOUR SOLUTION HERE */

    await (
      await ethers.getContractFactory("RemoveETH")
    ).deploy(receiver.address, pool.address); // Pass into Constructor
  });

  after(async function () {
    /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */
    // All ETH has been drained from the receiver
    expect(await ethers.provider.getBalance(receiver.address)).to.be.equal(0);
    expect(await ethers.provider.getBalance(pool.address)).to.be.equal(
      ETHER_IN_POOL + ETHER_IN_RECEIVER
    );
  });
});
