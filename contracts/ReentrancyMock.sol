// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./NFTCollection1155.sol";

contract ReentrancyMock {
    NFTCollection1155 public nftCollection;
    bool public reenter;

    constructor(NFTCollection1155 _nftCollection) {
        nftCollection = _nftCollection;
    }

    function triggerReentrancy(uint256 tokenId, uint256 amount, string memory tokenURI) public {
        reenter = true;
        nftCollection.mint(msg.sender, tokenId, amount, "", tokenURI);
        reenter = false;
    }

    function onERC1155Received(address, address, uint256, uint256, bytes memory) public returns (bytes4) {
        if (reenter) {
            nftCollection.mint(msg.sender, 1, 1, "", "https://example.com/token/1");
        }
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(address, address, uint256[] memory, uint256[] memory, bytes memory) public returns (bytes4) {
        if (reenter) {
            uint256[] memory ids = new uint256[](1);
            uint256[] memory amounts = new uint256[](1);
            ids[0] = 1;
            amounts[0] = 1;
            string[] memory uris = new string[](1);
            uris[0] = "https://example.com/token/1";
            nftCollection.mintBatch(msg.sender, ids, amounts, "", uris);
        }
        return this.onERC1155BatchReceived.selector;
    }
}
