// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.10;  

import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@opengsn/contracts/src/BaseRelayRecipient.sol";


contract Level1Completion is BaseRelayRecipient, ERC721URIStorage {  

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds; 

    constructor() ERC721("L1Completion","L1C") {
    }  

    /*
        constructor(address _trustedForwarder) ERC721("L1Completion","L1C") {
        _setTrustedForwarder(_trustedForwarder);
    } 
    */ 

    string public override versionRecipient = "2.2.0";

    function awardCertificate(address learner, string memory tokenURI) public returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(learner, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    //override functions

    function _msgSender() internal view override(Context, BaseRelayRecipient) returns (address sender) {
        sender = BaseRelayRecipient._msgSender();
  }

    function _msgData() internal view override(Context, BaseRelayRecipient) returns (bytes memory) {
        return BaseRelayRecipient._msgData();
  }

}
