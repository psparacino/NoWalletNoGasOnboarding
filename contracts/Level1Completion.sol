// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.10;  

import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@opengsn/contracts/src/BaseRelayRecipient.sol";


contract Level1Completion is BaseRelayRecipient, ERC721Enumerable, ERC721URIStorage {  

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds; 

  
        constructor(address _trustedForwarder) ERC721("L1Completion","L1C") {
        _setTrustedForwarder(_trustedForwarder);
    } 


    string public override versionRecipient = "2.2.0";

    event SuccessfulLevel1Mint(address, string, uint256); 


    function awardCertificate(address learner, string memory tokenImg) public returns (uint256) {
        require(balanceOf(learner) == 0, "learner has already been awarded this token");
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(learner, newItemId);
        _setTokenURI(newItemId, tokenImg);

        emit SuccessfulLevel1Mint(learner, tokenImg, newItemId);

        return newItemId;
    }

    //override functions for BaseRelay

    function _msgSender() internal view override(Context, BaseRelayRecipient) returns (address sender) {
        sender = BaseRelayRecipient._msgSender();
  }

    function _msgData() internal view override(Context, BaseRelayRecipient) returns (bytes memory) {
        return BaseRelayRecipient._msgData();
  }

  //override functions for ERC721 Enummerable

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}
