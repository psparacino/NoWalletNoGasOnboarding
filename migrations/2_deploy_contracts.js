const fs = require('fs')

const Level1Completion = artifacts.require('Level1Completion')

const WhitelistPaymaster = artifacts.require('WhitelistPaymaster');

const RelayHub = artifacts.require('RelayHub')


module.exports = async function (deployer) {

  // deploy CTF

  const forwarder = require('../src/localGSNbuilds/Forwarder.json').address

  console.log(forwarder, "forwarder")



  //deploy L1 Completion

  await deployer.deploy(Level1Completion, forwarder)
  .then((result) =>  {
      console.log("Level1Completion Deployed to:", result.address)
      fs.writeFile('./src/deployedContractAddresses/Level1Completion.json', `{ "address": "${result.address}" }`, (err) => {

        if (err)
        console.log(err, "L1 error");
        else {
          console.log("File written successfully\n");
        }
    
      })
    })

  const L1result = await Level1Completion.deployed()
  

  //Deploy Whitelist Paymaster

  //await deployer.deploy(WhitelistPaymaster);

  const relayHubAddress = "0x6650d69225CA31049DB7Bd210aE4671c0B1ca132";

  await deployer.deploy(WhitelistPaymaster)
  .then((result) =>  {
    console.log("WhitelistPaymaster Deployed to:", result.address)
    fs.writeFile('./src/deployedContractAddresses/WhitelistPaymaster.json', `{ "address": "${result.address}" }`, (err) => {

      if (err)
      console.log(err);
      else {
        console.log("File written successfully\n");
      }
  
    })
  })

    const paymaster = await WhitelistPaymaster.deployed()



    await paymaster.setRelayHub(relayHubAddress)

    await paymaster.setTrustedForwarder(forwarder)
  
    //allow Level1 Contract to use paymaster
  
    await paymaster.whitelistTarget(L1result.address);
  
    console.log(`RelayHub(${relayHubAddress}) set on Paymaster(${paymaster.address})`)

  
  

  const relayHub = await RelayHub.at(relayHubAddress)


  //inital deposit to paymaster
  await relayHub.depositFor(paymaster.address, {from:"0xe4632110872c2213b6E0C5B7b6a88583124a15a0", value: 1e18.toString()})
  
  console.log(`1 ETH deposited to Paymaster(${WhitelistPaymaster.address})`)

}
