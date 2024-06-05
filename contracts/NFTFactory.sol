// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./NFTCollection721.sol";
import "./NFTCollection1155.sol";

contract NFTFactory is Initializable, OwnableUpgradeable {
    event ERC721CollectionCreated(address indexed collectionAddress);
    event ERC1155CollectionCreated(address indexed collectionAddress);

    function initialize() public initializer {
        __Ownable_init(msg.sender);
    }

    function createERC721Collection(
        string memory name,
        string memory symbol,
        string memory description,
        uint256 mintPrice,
        uint256 startTime,
        uint256 endTime,
        uint256 maxSupply,
        bool isCapped,
        address royaltyReceiver,
        uint96 royaltyFraction,
        address owner
    ) external onlyOwner {
        NFTCollection721 collection = new NFTCollection721();
        NFTCollection721.InitParams memory params = NFTCollection721
            .InitParams({
                name: name,
                symbol: symbol,
                description: description,
                mintPrice: mintPrice,
                startTime: startTime,
                endTime: endTime,
                maxSupply: maxSupply,
                isCapped: isCapped,
                royaltyReceiver: royaltyReceiver,
                royaltyFraction: royaltyFraction,
                owner: owner
            });
        collection.initialize(params);
        emit ERC721CollectionCreated(address(collection));
    }

    function createERC1155Collection(
        string memory uri,
        uint256 mintPrice,
        uint256 startTime,
        uint256 endTime,
        uint256 maxSupply,
        bool isCapped,
        address royaltyReceiver,
        uint96 royaltyFraction,
        address owner
    ) external onlyOwner {
        NFTCollection1155 collection = new NFTCollection1155();
        collection.initialize(
            uri,
            mintPrice,
            startTime,
            endTime,
            maxSupply,
            isCapped,
            royaltyReceiver,
            royaltyFraction,
            owner
        );
        emit ERC1155CollectionCreated(address(collection));
    }
}
