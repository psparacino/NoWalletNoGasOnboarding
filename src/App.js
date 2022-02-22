
import { ethers } from 'ethers';
import { useState, useEffect } from "react";
import CaptureTheFlag from './build/CaptureTheFlag.json';
import Level1Completion from './build/Level1Completion.json';

import { RelayProvider } from '@opengsn/provider/dist/RelayProvider';

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

  //error msg
  const [errorMessage, setErrorMessage]= useState('');




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

        const paymasterAddress = require('./localGSNbuilds/Paymaster.json').address

        //using metamask as a provider for now. window.ethereum will change to whatever provider the app is using
        const gsnProvider = await RelayProvider.newProvider({
          provider: window.ethereum,
          config: {
              paymasterAddress
          }
        }).init()



        //create one time account
        const uniqueOneTimeAccount = gsnProvider.newAccount()
        setOneTimeAccount(uniqueOneTimeAccount)

        const relayedProvider =  new ethers.providers.Web3Provider(gsnProvider)

        setRelayProvider(relayedProvider)
        setProviderSet(true)     
        

        
      }

    },[])


  //getter functions

  //get ownerTokenID

  //poc function
  async function ctf() {
    //create new instance of contract
    const CaptureTheFlagAddress = "0x0E696947A06550DEf604e82C26fd9E493e576337";
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
    const Level1CompletionAddress = "0xDb56f2e9369E0D7bD191099125a3f6C370F8ed15";
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

  //need function that gets token ID by owner address, might need ERC721 enumberable
  
  return (
    <div className="App">
      <header className="App-header"> 

        {/*<button onClick={ctf}>Walletless and Gasless Mint</button> */}
        <button className='txnbutton' style={{fontSize: '40px', width: '50%'}} onClick={awardPOAP}>Award Level 1 POAP</button> 

            <input 
              name="userAddress" 
              type="text" 
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
      

      </header>
    </div>
  );
}


export default App;

