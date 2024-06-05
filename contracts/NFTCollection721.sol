// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract NFTCollection721 is
    Initializable,
    ERC721URIStorageUpgradeable,
    OwnableUpgradeable,
    ERC2981
{
    string public description;
    uint256 public mintPrice;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public maxSupply;
    bool public isCapped;
    uint256 private _tokenIdCounter;

    struct InitParams {
        string name;
        string symbol;
        string description;
        uint256 mintPrice;
        uint256 startTime;
        uint256 endTime;
        uint256 maxSupply;
        bool isCapped;
        address royaltyReceiver;
        uint96 royaltyFraction;
        address owner;
    }

    function initialize(InitParams memory params) public initializer {
        __ERC721_init(params.name, params.symbol);
        __ERC721URIStorage_init();
        __Ownable_init(params.owner);

        description = params.description;
        mintPrice = params.mintPrice;
        startTime = params.startTime;
        endTime = params.endTime;
        maxSupply = params.maxSupply;
        isCapped = params.isCapped;
        _tokenIdCounter = 0;

        _setDefaultRoyalty(params.royaltyReceiver, params.royaltyFraction);

        transferOwnership(params.owner);
    }

    function mint(address to, string memory tokenURI) external payable {
        require(
            block.timestamp >= startTime && block.timestamp <= endTime,
            "Minting not active"
        );
        require(msg.value >= mintPrice, "Insufficient funds");
        require(!isCapped || _tokenIdCounter < maxSupply, "Max supply reached");

        _safeMint(to, _tokenIdCounter);
        _setTokenURI(_tokenIdCounter, tokenURI);
        _tokenIdCounter++;
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC721URIStorageUpgradeable, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
