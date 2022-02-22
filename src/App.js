
import { ethers } from 'ethers';
import { useState, useEffect } from "react";

//ABIs
import CaptureTheFlag from './build/CaptureTheFlag.json';
import Level1Completion from './build/Level1Completion.json';
import WhitelistPaymaster from './build/WhitelistPaymaster.json';
import RelayHub from './build/RelayHub.json';


//GSN provider

import { RelayProvider } from '@opengsn/provider/dist/RelayProvider';


//Address

import level1CompletionDeployed from './deployedContractAddresses/Level1Completion.json';
import whitelistPaymasterDeployed from './localGSNbuilds/WhitelistPaymasterAddress.json';

import relayHubDeployed from './localGSNbuilds/RelayHub.json';

import './App.css';



function App() {
  const [relayProvider, setRelayProvider] = useState('');
  //const [CaptureTheFlagContract, setCaptureTheFlagContract] = useState('');
  const [oneTimeAccount, setOneTimeAccount] = useState()
  const [providerSet, setProviderSet] = useState(false)

  //txn results
  const [proofOfTxn, setProofOfTxn]= useState()
  const [userSubmittedAddress, setUserSubmittedAddress] = useState('');
  const [poapTokenID, setPAOPTokenID] = useState(0);
  const [poapTokenURI, setPAOPTokenURI] = useState('');

  //Paymaster

  const [paymasterBalance, setPaymasterBalance]= useState(0);
  const [wlpmAddress, setWlpmAddress] = useState();

  //contract Objects

  const [relayHubContract, setRelayHubContract] = useState()

  const [relayHubContractSign, setRelayHubContractSign] = useState()


  //error msg
  const [errorMessage, setErrorMessage]= useState('');


  const paymasterArtifact = require('./build/WhitelistPaymaster.json')



  useEffect(()=> {

    if (window.ethereum) {
        initContract()
        .then(result => console.log(result, "result"))
        .catch(error => console.log(error, "error"))

        console.log("ethereum is here")
      } else {
        console.log("ethereum not found")
      }

      async function initContract() {

        const networkId = await window.ethereum.request({method: 'net_version'})

        console.log(networkId, "networkId")

        const paymasterAddress = require('./localGSNbuilds/Paymaster.json').address


        const whiteListPaymasterAddress = paymasterArtifact.networks[networkId].address;

        setWlpmAddress(whiteListPaymasterAddress);

        //using metamask as a provider for now. window.ethereum will change to whatever provider the app is using
        const gsnProvider = await RelayProvider.newProvider({
          provider: window.ethereum,
          config: {
              paymasterAddress : whiteListPaymasterAddress
          }
        }).init()


        //create one time account
        const uniqueOneTimeAccount = gsnProvider.newAccount()
        setOneTimeAccount(uniqueOneTimeAccount)

        const relayedProvider =  new ethers.providers.Web3Provider(gsnProvider)

        setRelayProvider(relayedProvider)
        setProviderSet(true)     
        

        
      }

    },[paymasterArtifact.networks])

    //gets paymaster balanace and sets sign/nosign version of RelayHub
    useEffect(()=> {

      if (relayProvider) {
        getPaymasterBalance()
      }

      async function getPaymasterBalance() {
        const whitelistAddress = whitelistPaymasterDeployed.address;
        const relayContract = await new ethers.Contract(relayHubDeployed.address, RelayHub.abi, relayProvider.getSigner());

        setRelayHubContract(relayContract);

        const regularProvider =  new ethers.providers.Web3Provider(window.ethereum);

        const relayContractSign = await new ethers.Contract(relayHubDeployed.address, RelayHub.abi, regularProvider.getSigner(0));

        setRelayHubContractSign(relayContractSign);


        //const whitelistContractEphemeral = whitelistContract.connect(relayProvider.getSigner(oneTimeAccount.address))
  
        //const balance = await relayProvider.getBalance(whitelistContractEphemeral.address)
  
        //const whitelistYesOrNo = await whitelistContractEphemeral.targetWhitelist("0x71E02441209d3dd9Ed064A4E4EafAf90D0263088")
  
        const balance = await relayContract.balanceOf(whitelistAddress)
        setPaymasterBalance(ethers.utils.formatEther(balance))
        
        

      }  
  
      },[relayProvider])
      


  //getter functions

  

  //poc function
  async function ctf() {
    //create new instance of contract
    const CaptureTheFlagAddress = "0xC045C7B6B976d24728872d2117073c893d0B09C2";
    const CaptureTheFlagContract = await new ethers.Contract(CaptureTheFlagAddress, CaptureTheFlag.abi, relayProvider.getSigner());

    //let onetimeAccount connect to contract
    const CaptureTheFlagContractEphemeral = CaptureTheFlagContract.connect(relayProvider.getSigner(oneTimeAccount.address))

    
 
    CaptureTheFlagContractEphemeral.captureTheFlag()
      .then((result) => {
        console.log(result, "ctf result") 
        setProofOfTxn(result)
      })
      .catch((error)=> console.log(error))
    
  }


  

  //Level1Completiion Contract Function

  async function awardPOAP() {
    //create new instance of contract
    const Level1CompletionAddress = level1CompletionDeployed.address;
    const Level1CompletionContract = await new ethers.Contract(Level1CompletionAddress, Level1Completion.abi, relayProvider.getSigner());
    //let onetimeAccount connect to contract
    const Level1CompletionContractEphemeral = Level1CompletionContract.connect(relayProvider.getSigner(oneTimeAccount.address))


    if (ethers.utils.isAddress(userSubmittedAddress)) {

    setErrorMessage('')

    Level1CompletionContractEphemeral.awardCertificate(userSubmittedAddress, 'https://random.imagecdn.app/500/150')
      .then((result) => {
        console.log(result, "award result") 
        setProofOfTxn(result)
      })
      .then(setUserSubmittedAddress(''))
      .then(async() => {
        const newTokenID = (await Level1CompletionContract.tokenOfOwnerByIndex(userSubmittedAddress, 0)).toNumber()

        const newTokenURI = await Level1CompletionContract.tokenURI(newTokenID);
        setPAOPTokenID(newTokenID)
        setPAOPTokenURI(newTokenURI)

        console.log(userSubmittedAddress, "userSubmittedAddress", newTokenID, "newTokenID", newTokenURI, "RELEVANT TXN RESULTS RESULTS")

      })
      .catch((error)=> {
        console.log(error, "award error")
        setErrorMessage(error.data.message)
      })

    } else{
      setErrorMessage('Please enter a valid address')
    }
    
  }

  //Paymaster Functions

  async function refillPaymaster() {
    //need to be on deploying account to send
    await relayHubContractSign.depositFor(wlpmAddress, {value: 2e18.toString()})
    .then(result => console.log(result))

  }

  
  return (
    <div className="App">
      <header className="App-header"> 

        {/*<button onClick={ctf}>Walletless and Gasless Mint</button> */}
        <p>refresh the page for repeat transactions</p>
        <br />
        <button className='txnbutton' style={{fontSize: '40px', width: '50%'}} onClick={awardPOAP}>Award Level 1 POAP</button> 

            <input 
              name="userAddress" 
              type="text" 
              placeholder='enter learner address here'
              onChange={(e) => setUserSubmittedAddress(e.target.value)} 
              value={userSubmittedAddress}
              style={{width: '60%', fontSize: '20px', marginTop: '50px'}} />

         { proofOfTxn ?
          <p style={{color : 'white', fontSize: '30px'}}>Proof Of Txn: {proofOfTxn.hash}</p> :
          null
        }

        { poapTokenID ?
          <p style={{color : 'white'}}>New Token ID: {poapTokenID}</p> :
          null
        }

        { poapTokenURI ?
            <>
              <p style={{color : 'white'}}>Token Image:</p>
              <img src={poapTokenURI} alt={"poap token img"} />
            </>
           :
          null
        }

   
        {errorMessage}

        <hr style={{color: 'white', width: '80%'}} />

        <h2>Paymaster Interaction</h2>

        <p>Current Balance of Paymaster is: {paymasterBalance} eth</p>

        <button onClick={refillPaymaster}>Refill Paymaster</button>

      

      </header>
    </div>
  );
}


export default App;

