const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("NFTFactory", function () {
  let NFTFactory, factory, NFTCollection721, NFTCollection1155, owner, addr1;
  const mintPrice = ethers.parseEther("0.1"); // 0.1 ETH
  const maxSupply = 10;
  const startTime = Math.floor(Date.now() / 1000); // current time
  const endTime = startTime + 3600; // 1 hour from now

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    NFTFactory = await ethers.getContractFactory("NFTFactory");
    NFTCollection721 = await ethers.getContractFactory("NFTCollection721");
    NFTCollection1155 = await ethers.getContractFactory("NFTCollection1155");

    factory = await upgrades.deployProxy(NFTFactory, [], {
      initializer: "initialize",
    });

    await factory.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await factory.owner()).to.equal(owner.address);
    });
  });

  describe("Create ERC721 Collection", function () {
    it("Should create an ERC721 collection", async function () {
      const tx = await factory.createERC721Collection(
        "TestNFT",
        "TNFT",
        "Test NFT Collection",
        mintPrice,
        startTime,
        endTime,
        maxSupply,
        true,
        owner.address,
        500, // 5% royalties
        owner.address
      );

      const receipt = await tx.wait();

      const eventFragment = NFTFactory.interface.getEvent("ERC721CollectionCreated");
      const event = receipt.logs
        .map(log => {
          try {
            return NFTFactory.interface.decodeEventLog(eventFragment, log.data, log.topics);
          } catch (error) {
            return null;
          }
        })
        .find(decoded => decoded !== null);

      // Debugging: Log event details
      console.log("ERC721 Collection Created Event:", event);

      expect(event).to.not.be.undefined;

      const collectionAddress = event.collectionAddress;
      const nftCollection = await NFTCollection721.attach(collectionAddress);

      expect(await nftCollection.name()).to.equal("TestNFT");
      expect(await nftCollection.symbol()).to.equal("TNFT");
      expect(await nftCollection.description()).to.equal("Test NFT Collection");
      expect(await nftCollection.mintPrice()).to.equal(mintPrice);
    });
  });

  describe("Create ERC1155 Collection", function () {
    it("Should create an ERC1155 collection", async function () {
      const tx = await factory.createERC1155Collection(
        "ipfs://test-uri",
        mintPrice,
        startTime,
        endTime,
        maxSupply,
        true,
        owner.address,
        500, // 5% royalties
        owner.address
      );

      const receipt = await tx.wait();

      const eventFragment = NFTFactory.interface.getEvent("ERC1155CollectionCreated");
      const event = receipt.logs
        .map(log => {
          try {
            return NFTFactory.interface.decodeEventLog(eventFragment, log.data, log.topics);
          } catch (error) {
            return null;
          }
        })
        .find(decoded => decoded !== null);

      // Debugging: Log event details
      console.log("ERC1155 Collection Created Event:", event);

      expect(event).to.not.be.undefined;

      const collectionAddress = event.collectionAddress;
      const nftCollection = await NFTCollection1155.attach(collectionAddress);

      expect(await nftCollection.uri(0)).to.equal("ipfs://test-uri");
      expect(await nftCollection.mintPrice()).to.equal(mintPrice);
    });
  });
});
