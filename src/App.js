
import { ethers } from 'ethers';
import { useState, useEffect } from "react";

//ABIs
import Level1Completion from './build/Level1Completion.json';
import RelayHub from './build/RelayHub.json';


//GSN provider

import { RelayProvider } from '@opengsn/provider/dist/RelayProvider';



//Address

import level1CompletionDeployed from './deployedContractAddresses/Level1Completion.json';

import whitelistDeployed from './deployedContractAddresses/WhitelistPaymaster.json';

import relayHubDeployed from './rinkebyBuilds/RelayHub.json';


//style
import './App.css';

import { BeatLoader } from 'react-spinners';

const HttpProvider = require( 'web3-providers-http')


function App() {
  const [relayProvider, setRelayProvider] = useState('');
  const [oneTimeAccount, setOneTimeAccount] = useState();


  //txn results
  const [proofOfTxn, setProofOfTxn]= useState();
  const [userSubmittedAddress, setUserSubmittedAddress] = useState('');
  const [poapTokenID, setPAOPTokenID] = useState(0);
  const [poapTokenURI, setPAOPTokenURI] = useState('');
  const [balanceUpdated, setBalanceUpdated] = useState(false);

  //notifications
  const [loading, setLoading] = useState(false);
  const [relayMessage, setRelayMessage] = useState('');

  //Paymaster

  const [paymasterBalance, setPaymasterBalance]= useState(0);
  const [whitelistPMAddress, setWhitelistPMAddress] = useState();

  //contract Objects

  const [relayHubContractSign, setRelayHubContractSign] = useState();
  const [Level1CompletionContractEphemeral, setLevel1CompletionContractEphemeral] = useState();


  //error msg
  const [errorMessage, setErrorMessage]= useState('');

  //http provider 
  const [localHttpProvider, setLocalHttpProvider] = useState('')


  //set provider and WhiteListPaymaster addresss

  useEffect(()=> {
    
 
        initContract()
        .then(result => console.log(result, "init result"))
        .catch(error => console.log(error, "init error"))

  
 

      async function initContract() {

        setWhitelistPMAddress(whitelistDeployed.address);

        const gsnConfig = {
          relayLookupWindowBlocks: 1e5,
          relayRegistrationLookupBlocks: 1e5,
          pastEventsQueryMaxPageSize: 2e4,
          paymasterAddress : whitelistDeployed.address,
          gasPrice: 0
        }


        let httpweb3provider = new HttpProvider("https://eth-rinkeby.alchemyapi.io/v2/lUClO9NkAFshlkgvnVQD0IwrkYIRCHU_")
        setLocalHttpProvider(httpweb3provider)

        const gsnProvider = await RelayProvider.newProvider({
          provider: httpweb3provider,
          config: gsnConfig
        }).init()

        
        const relayedProvider =  new ethers.providers.Web3Provider(gsnProvider)
        setRelayProvider(relayedProvider) 

        //create one time account
        const uniqueOneTimeAccount = gsnProvider.newAccount()
        setOneTimeAccount(uniqueOneTimeAccount)        
      }

    },[])


    //create Contract Instances

    useEffect(()=> {

      if (relayProvider && oneTimeAccount) {
        createContractObjects()
      }

      async function createContractObjects() {

        //create new instance of relayHub for owner use
        
        const regularProvider =  new ethers.providers.AlchemyProvider('rinkeby', process.env.REACT_APP_ALCHEMY_API_KEY)
        const ownerWalletWithProvider = new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY, regularProvider);
        const relayContractSign = await new ethers.Contract(relayHubDeployed.address, RelayHub.abi, ownerWalletWithProvider);
        setRelayHubContractSign(relayContractSign);

        //create new instance of Level1Completion contract
        const Level1CompletionAddress = level1CompletionDeployed.address;
        const Level1CompletionContract = await new ethers.Contract(Level1CompletionAddress, Level1Completion.abi, relayProvider.getSigner());

        //let onetimeAccount connect to contract
        const ephemeralContract = Level1CompletionContract.connect(relayProvider.getSigner(oneTimeAccount.address))
        setLevel1CompletionContractEphemeral(ephemeralContract)

      }  
  
      },[relayProvider, oneTimeAccount, localHttpProvider])
      


      //balance listener

      useEffect(()=> {

        if ((whitelistPMAddress && relayHubContractSign) || balanceUpdated) {
          updateBalance()
        }
  
        async function updateBalance() {
          const balance = await relayHubContractSign.balanceOf(whitelistPMAddress)
          const formattedBalance = ethers.utils.formatEther(balance)

          setPaymasterBalance(formattedBalance)
          setBalanceUpdated(false)

        }  
    
        },[whitelistPMAddress, relayHubContractSign, balanceUpdated])

    

  //Level1Completiion Contract Function

  async function awardPOAP() {
    if (ethers.utils.isAddress(userSubmittedAddress)) {
      setRelayMessage('Relay Sent. Waiting for response...')
      setErrorMessage('')
      Level1CompletionContractEphemeral.awardCertificate(userSubmittedAddress, 'https://random.imagecdn.app/500/150')
        .then((result) => {
          console.log(result, "award result") 
          setRelayMessage('')
          setProofOfTxn(result)
          setLoading(true)
          relayProvider.waitForTransaction(result.hash)
            .then(async() => {           
              const newTokenID = await Level1CompletionContractEphemeral.tokenOfOwnerByIndex(userSubmittedAddress, 0)
              const newTokenURI = await Level1CompletionContractEphemeral.tokenURI(newTokenID);
              setPAOPTokenID(newTokenID)
              setPAOPTokenURI(newTokenURI)
              setUserSubmittedAddress('')
              setLoading(false)
              console.log({"userSubmittedAddress" : userSubmittedAddress, "newTokenID" : newTokenID.toNumber(), "RELEVANT TXN RESULTS RESULTS" : newTokenURI})
    
            })
        })

        .catch((error)=> {
          setLoading(false)
          console.log(error.data.message, "award error")
          if ((error.message).includes("awarded")) {
            setErrorMessage('learner has already been awarded this token')
          } else {
          setErrorMessage(error)
          }
          
        })

    } else{
        setErrorMessage('Please enter a valid ethereum address')
    }
    
  }

  const RandomWallet = () => {
    const [randomAddress, setRandomAddress]= useState('');

    function setRandom() {
      const  newWallet = ethers.Wallet.createRandom()
      setRandomAddress(newWallet.address);
    }

  
    return(
      <>
        <button className="siteButton" onClick={setRandom}> Create random address:</button>
        {randomAddress ? 
          <p>{randomAddress}</p> :
          null}
      </>
    )
  }

  //Paymaster Component


  const RefillPaymaster = () => {
    //need to be on deploying account to send
    const [amount, setAmount]= useState(0);
    const [amountMessage, setAmountMessage] = useState('');

    useEffect(()=> {
      setAmountMessage('')
      setAmount(0)
      },[])
    
    async function deposit () {
      if (amount > 0){
      setLoading(true)
      await relayHubContractSign.depositFor(whitelistPMAddress, {value: amount.toString()})
        .then((result) => {
          relayProvider.waitForTransaction(result.hash)
          .then((result) => {
            if (result) {
              setBalanceUpdated(true);
              setLoading(false)
              
            }
          })
        })
        .catch((err) => {
          console.log(err, 'refill error') 
          setLoading(false)
        })
        } else {
          setAmountMessage('enter an amount greater than zero')
        }
  }


 

  return (
  
    
    <div style={{width: '60%'}}>
      <button onClick={deposit} className="siteButton" style={{fontSize: '30px', width: '70%'}}>Send to Paymaster</button>
      {amountMessage ?
      <p>{amountMessage}</p>
      : null}  

      <input 
      name="refillPaymaster" 
      type="text" 
      placeholder='enter amount to send to paymaster'
      onChange={(e) => setAmount(e.target.value)} 
      value={amount || ''}
      style={{width: '80%', height: '40px', fontSize: '20px', marginTop: '30px', textAlign: 'center'}} />
      
       

    </div>


  )

  }

  
  return (
    <div className="App">
      <div className="App-body"> 
        <h2>Wallet and Gas Free Onboarding Demo</h2>
        <div className="info-text">
          <p style={{fontSize: '17px'}}>This page demonstrates a method to facilitate web3 user onboarding by allowing users to interact with deployed contracts/mint an NFT without needing to pay gas or having their own wallet using a combination of OpenGsn, Alchemy, and ephemeral accounts.</p>
          <hr />
          <h4>To Use:</h4>
            <p>1. Create a new ethereum address below (each address can only mint once)</p>
            <p>2. Enter address in input</p>
            <p>3. Click Mint NFT to an NFT on the Rinkeby test network</p>
            <p style={{fontSize: '15px', paddingBottom: '15px'}}>Open the console to see the relay processes</p>

        </div>
        <RandomWallet />
        
        <br />
        <button className='txnButton' style={{fontSize: '40px', width: '50%'}} onClick={awardPOAP}>Mint NFT</button> 
        {relayMessage ? 
        <p>{relayMessage}</p> :
        null }

            <input 
              name="userAddress" 
              type="text" 
              placeholder='enter ethereum address here'
              onChange={(e) => setUserSubmittedAddress(e.target.value)} 
              value={userSubmittedAddress || ''}
              style={{width: '65%', height: '40px', fontSize: '20px', marginTop: '30px', textAlign: 'center'}} />

         { proofOfTxn ?
          <p style={{color : 'white', fontSize: '25px'}}>Transaction Hash: {proofOfTxn.hash}</p> :
          null
        }
        {loading ? 
        <div style={{marginTop: '30px'}}>
          <BeatLoader color={'gray'} loading={loading} size={50}/>
          <p>Waiting for transaction to mine...</p> 
        </div>         
        : null }   
        
        { poapTokenID ?
            <>
              <p style={{fontWeight :'bold', color: 'green'}}>Transaction Success!</p> 
              <p style={{color : 'white'}}>New Token ID: {poapTokenID.toNumber()}</p>
            </>
           :
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
          <p className='info-text'>Gas fees are paid by a Paymaster contract in the relay system. This contract's balance needs to be maintained by the deployer. Sample function below.</p>
          <p style={{marginBottom: '30px'}}>Current Balance of Paymaster is: {paymasterBalance} eth</p>
        <RefillPaymaster />

      </div>
    </div>
  );
}


export default App;

