const fs = require('fs')

const Level1Completion = artifacts.require('Level1Completion')

const WhitelistPaymaster = artifacts.require('WhiteListPaymaster');

const RelayHub = artifacts.require('RelayHub')


async function main() {

    const InstrumentDeedToken = await ethers.getContractFactory("InstrumentDeedToken");
    const instrumentdeedtoken = await InstrumentDeedToken.deploy();
  
    

    fs.writeFileSync('./src/deployedContractAddresses/instrumenttokenaddress.json', `{ "token_address": "${instrumentdeedtoken.address}" }`, (err) => {
      if (err) {
        console.log(err, "error")
      } else { 
        console.log("InstrumentDeedToken address written successfully\n"); 
      }
      })

      console.log("InstrumentDeedToken deployed to:", instrumentdeedtoken.address);
  }
  
  main()
    .then(() => process.exit(0))  
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });





    const fs = require('fs')

const Level1Completion = artifacts.require('Level1Completion')

const WhitelistPaymaster = artifacts.require('WhiteListPaymaster');

const RelayHub = artifacts.require('RelayHub')


module.exports = async function (deployer) {

  // deploy CTF

  const forwarder = require('../build/gsn/Forwarder.json').address
  //const CTFresult = await deployer.deploy(CaptureTheFlag, forwarder)

  //console.log("Capture the Flag Deployed to:", CTFresult)


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

  const relayHubAddress = "0x6650d69225CA31049DB7Bd210aE4671c0B1ca132";

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
  await relayHub.depositFor(paymaster.address, {from:"0xe4632110872c2213b6E0C5B7b6a88583124a15a0", value: 1e18.toString()})
  
  console.log(`1 ETH deposited to Paymaster(${WhitelistPaymaster.address})`)

}
