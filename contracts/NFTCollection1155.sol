// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract NFTCollection1155 is
    Initializable,
    ERC1155Upgradeable,
    OwnableUpgradeable,
    ERC2981
{
    uint256 public mintPrice;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public maxSupply;
    bool public isCapped;
    uint256 private _tokenIdCounter;

    function initialize(
        string memory uri,
        uint256 _mintPrice,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _maxSupply,
        bool _isCapped,
        address royaltyReceiver,
        uint96 royaltyFraction,
        address owner
    ) public initializer {
        __ERC1155_init(uri);
        __Ownable_init(owner);

        mintPrice = _mintPrice;
        startTime = _startTime;
        endTime = _endTime;
        maxSupply = _maxSupply;
        isCapped = _isCapped;
        _tokenIdCounter = 0;

        _setDefaultRoyalty(royaltyReceiver, royaltyFraction);

        transferOwnership(owner);
    }

    function mint(
        address to,
        uint256 amount,
        bytes memory data
    ) external payable {
        require(
            block.timestamp >= startTime && block.timestamp <= endTime,
            "Minting not active"
        );
        require(msg.value >= mintPrice * amount, "Insufficient funds");
        require(
            !isCapped || _tokenIdCounter + amount <= maxSupply,
            "Max supply reached"
        );

        _mint(to, _tokenIdCounter, amount, data);
        _tokenIdCounter += amount;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC1155Upgradeable, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
