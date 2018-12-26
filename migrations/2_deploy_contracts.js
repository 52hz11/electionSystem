var ConvertLib = artifacts.require('./ConvertLib.sol')
var election = artifacts.require('./election.sol')

module.exports = function (deployer) {
  deployer.deploy(ConvertLib)
  deployer.link(ConvertLib, election)
  deployer.deploy(election)
}
