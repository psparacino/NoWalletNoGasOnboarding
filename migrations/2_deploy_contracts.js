const CaptureTheFlag = artifacts.require('CaptureTheFlag')
const Level1Completion = artifacts.require('Level1Completion')


module.exports = async function (deployer) {
  const forwarder = require('../build/gsn/Forwarder.json').address
  const CTFresult = await deployer.deploy(CaptureTheFlag, forwarder)

  console.log("Capture the Flag Deployed to:", CTFresult)


  const L1result = await deployer.deploy(Level1Completion, forwarder)

  console.log("Level1Completion Deployed to:", L1result.address)
}
