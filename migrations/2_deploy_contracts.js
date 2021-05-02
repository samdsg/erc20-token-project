const SappToken = artifacts.require("SappToken");

module.exports = function (deployer) {
  deployer.deploy(SappToken, 1000000);
};
