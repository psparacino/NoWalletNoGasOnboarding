const fs = require('fs')

const CaptureTheFlag = artifacts.require('CaptureTheFlag')
const Level1Completion = artifacts.require('Level1Completion')

const WhitelistPaymaster = artifacts.require('WhiteListPaymaster');

const RelayHub = artifacts.require('RelayHub')


module.exports = async function (deployer) {

  // deploy CTF

  const forwarder = require('../build/gsn/Forwarder.json').address
  const CTFresult = await deployer.deploy(CaptureTheFlag, forwarder)

  console.log("Capture the Flag Deployed to:", CTFresult)


  //deploy L1 Completion

  const L1result = await deployer.deploy(Level1Completion, forwarder)

  console.log("Level1Completion Deployed to:", L1result.address)

  fs.writeFile('./src/deployedContractAddresses/Level1Completion.json', `{ "address": "${L1result.address}" }`, (err) => {

    if (err)
    console.log(err);
    else {
      console.log("File written successfully\n");
    }

  })

  //Deploy Whitelist Paymaster

  await deployer.deploy(WhitelistPaymaster);

  const relayHubAddress = require('../build/gsn/RelayHub.json').address

  const paymaster = await WhitelistPaymaster.deployed()

  fs.writeFile('./src/localGSNbuilds/WhitelistPaymasterAddress.json', `{ "address": "${paymaster.address}" }`, (err) => {

    if (err)
    console.log(err);
    else {
      console.log("File written successfully\n");
    }

  })

  await paymaster.setRelayHub(relayHubAddress)

  await paymaster.setTrustedForwarder(forwarder)

  //allow Level1 Contract to use paymaster

  await paymaster.whitelistTarget(L1result.address);

  console.log(`RelayHub(${relayHubAddress}) set on Paymaster(${WhitelistPaymaster.address})`)

  const relayHub = await RelayHub.at(relayHubAddress)


  //inital deposit to paymaster
  await relayHub.depositFor(paymaster.address, {value: 2e18.toString()})
  
  console.log(`1 ETH deposited to Paymaster(${WhitelistPaymaster.address})`)

}
