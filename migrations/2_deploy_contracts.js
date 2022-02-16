const CaptureTheFlag = artifacts.require('CaptureTheFlag')


module.exports = async function (deployer) {
  const forwarder = require('../build/gsn/Forwarder.json').address
  await deployer.deploy(CaptureTheFlag, forwarder)
}
