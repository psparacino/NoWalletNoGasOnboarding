## User Walletless and Gasless User Contract Interaction

**Demo Page**--> https://psparacino.github.io/NoWalletNoGasOnboarding/

Web3 as it currently stands requires a certain level of user savvy in order to interact by using wallets, managing addresses, and maintaining a reasonable level of personal security.  This demo app demonstrates a method to abstract the gas fees and wallet requirements to initally onboard users and allow them to interact with a deployed contract with no additional tools. Using the OpenGsn network, Alchemy, and ephemeral in-browser addresses this app allows users to mint an NFT without any need for a wallet or to pay gas fees.

The basic flow in the app:
1. Users enter their ethereum address in the input field.
2. As the contract only allows each user to mint one NFT, there is a button on the site to create additional ethereum addressses for repeat testing.
3. OpenGsn by itself still requires signing a transacation, even though there is no fee, which of course requires a wallet. In this app, a new ephemeral account is created on page load connected to the account, which is connected to the contract instance which allows it to automatically sign the transaction this eliminating the need for a wallet.
4. The request is relayed through the OpenGsn network, first through a Forwarder contract, then to a Relay Hub.
5. The RelayHub contract calls the Paymaster Contract (deployed and supplied with a balance for gas by the owner).
6. The Paymaster contract pays the gas fee and the NFT is minted.
7. The result returns.

Thanks to OpenGsn!

Created with Create-React-App, truffle, Alchemy, ethers

