const Migrations = artifacts.require("Migrations");

module.exports = function(deployer) {
  console.log("hitting")
  deployer.deploy(Migrations);
};
