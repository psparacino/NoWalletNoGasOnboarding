import MetaMaskButton from './components/MetaMaskButton.js';



import { ethers } from 'ethers';
import { useState, useEffect } from "react";
import CaptureTheFlag from './build/CaptureTheFlag.json';

import { RelayProvider } from '@opengsn/provider/dist/RelayProvider';

import './App.css';



function App() {
  //const {mainAccount, setMainAccount, provider, signer} = useHandleEthereum();
  //const { CaptureTheFlagContract } = useContractObjectRepo();

  const [mainAccount, setMainAccount] = useState('');
  const [signer, setSigner] = useState('');
  const [relayProvider, setRelayProvider] = useState('');
  //const [CaptureTheFlagContract, setCaptureTheFlagContract] = useState('');
  const [oneTimeAccount, setOneTimeAccount] = useState()
  const [providerSet, setProviderSet] = useState(false)
  const [proofOfTxn, setProofOfTxn]= useState()



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


  async function award() {
    //create new instance of contract
    const CaptureTheFlagAddress = "0x0E696947A06550DEf604e82C26fd9E493e576337";
    const CaptureTheFlagContract = await new ethers.Contract(CaptureTheFlagAddress, CaptureTheFlag.abi, relayProvider.getSigner());

    //let onetimeAccount connect to contract
    const CaptureTheFlagContractEphemeral = CaptureTheFlagContract.connect(relayProvider.getSigner(oneTimeAccount.address))
 
    CaptureTheFlagContractEphemeral.captureTheFlag()
      .then((result) => {
        console.log(result, "award result") 
        setProofOfTxn(result)
      })
      .catch((error)=> console.log(error))
    
  }


  return (
    <div className="App">
      <header className="App-header">   

        <button className='txnbutton' style={{fontSize: '50px'}} onClick={award}>Walletless and Gasless Mint</button> 
        { proofOfTxn ?
        <p style={{color : 'white'}}>Proof Of Txn: {proofOfTxn.hash}</p> :
        null
        }

      </header>
    </div>
  );
}


export default App;

