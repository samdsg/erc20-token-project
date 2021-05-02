const SappToken = artifacts.require("./SappToken");

contract("SappToken", (accounts) => {
  var admin = accounts[0];
  var buyer = accounts[1];
  var tokenInstance;

  //   Check for total Number of tokens
  it("should check for total supply", function () {
    return SappToken.deployed()
      .then(function (instance) {
        tokenInstance = instance;
        return tokenInstance.allSupply();
      })
      .then(function (supply) {
        assert.equal(supply.toNumber(), 1000000, "total supply is wrong");
      });
  });

  // Transfer token
  it("used to transfer token to other accounts", function () {
    return SappToken.deployed()
      .then(function (instance) {
        tokenInstance = instance;
        return tokenInstance.totalSupply();
      })
      .then(function (totalSupply) {
        assert.equal(
          totalSupply.toNumber(),
          1000000,
          "check if total supply is 10,000,000"
        );
        return tokenInstance.balanceOf(admin);
      })
      .then(function (adminBalance) {
        assert.equal(
          adminBalance.toNumber(),
          1000000,
          "it allocates the initial supply to the admin account"
        );

        return tokenInstance.transfer(buyer, 250000, {
          from: admin,
        });
      })
      .then((receipt) => {
        assert.equal(receipt.logs.length, 1, "triggers one event");

        assert.equal(receipt.logs[0].event, "Transfer", "if Transfer event?");

        assert.equal(
          receipt.logs[0].args._from,
          admin,
          "main account to transfer from?"
        );

        assert.equal(
          receipt.logs[0].args._to,
          buyer,
          "same account trasnferred to?"
        );

        // Return balance of account 1
        return tokenInstance.balanceOf(accounts[1]);
      })
      .then((balance) => {
        assert.equal(
          balance.toNumber(),
          250000,
          "return the amount of account[1]"
        );
        // Return balance of the account which made the transfer
        return tokenInstance.balanceOf(admin);
      })
      .then((balance) => {
        assert.equal(
          balance.toNumber(),
          750000,
          "check if the main account balance is reduced by 250,000"
        );
      });
  });

  it("handles delegated token transfers", function () {
    var fromAccount = accounts[2];
    var spendingAccount = accounts[3];
    var toAccount = accounts[3];

    return SappToken.deployed()
      .then((instance) => {
        tokenInstance = instance;

        tokenInstance.transfer(fromAccount, 1000, { from: admin });
        return tokenInstance.balanceOf(fromAccount);
      })
      .then((balance) => {
        return tokenInstance.approve(spendingAccount, 800, {
          from: fromAccount,
        });
      })
      .then((receipt) => {
        return tokenInstance.transferFrom(fromAccount, toAccount, 99, {
          from: spendingAccount,
        });
      })
      .then(function (receipt) {
        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(
          receipt.logs[0].event,
          "Transfer",
          'should be the "Transfer" event'
        );
        assert.equal(
          receipt.logs[0].args._from,
          fromAccount,
          "logs the account the tokens are transferred from"
        );
        assert.equal(
          receipt.logs[0].args._to,
          toAccount,
          "logs the account the tokens are transferred to"
        );

        assert.equal(
          receipt.logs[0].args._value,
          99,
          "logs the transfer amount"
        );
        return tokenInstance.balanceOf(fromAccount);
      });
  });
});
