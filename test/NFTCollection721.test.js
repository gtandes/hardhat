const { expect } = require("chai");
const { ethers } = require("ethers");

describe("NFTCollection721", function () {
  let NFTCollection721, nftCollection, owner, addr1, addr2;
  const mintPrice = ethers.utils.parseEther("0.1"); // 0.1 ETH
  const maxSupply = 10;
  const startTime = Math.floor(Date.now() / 1000); // current time
  const endTime = startTime + 3600; // 1 hour from now

  beforeEach(async function () {
    [owner, addr1, addr2, _] = await ethers.getSigners();

    NFTCollection721 = await ethers.getContractFactory("NFTCollection721");

    const initParams = {
      name: "TestNFT",
      symbol: "TNFT",
      description: "Test NFT Collection",
      mintPrice: mintPrice,
      startTime: startTime,
      endTime: endTime,
      maxSupply: maxSupply,
      isCapped: true,
      royaltyReceiver: owner.address,
      royaltyFraction: 500, // 5%
      owner: owner.address
    };

    nftCollection = await NFTCollection721.deploy();
    await nftCollection.deployed();
    await nftCollection.initialize(initParams);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await nftCollection.owner()).to.equal(owner.address);
    });

    it("Should set the correct parameters", async function () {
      expect(await nftCollection.description()).to.equal("Test NFT Collection");
      expect(await nftCollection.mintPrice()).to.equal(mintPrice);
      expect(await nftCollection.startTime()).to.equal(startTime);
      expect(await nftCollection.endTime()).to.equal(endTime);
      expect(await nftCollection.maxSupply()).to.equal(maxSupply);
      expect(await nftCollection.isCapped()).to.equal(true);
    });
  });

  describe("Minting", function () {
    it("Should allow minting within the time frame", async function () {
      const tokenURI = "ipfs://test-token-uri";
      await nftCollection.connect(addr1).mint(addr1.address, tokenURI, { value: mintPrice });

      expect(await nftCollection.ownerOf(0)).to.equal(addr1.address);
      expect(await nftCollection.tokenURI(0)).to.equal(tokenURI);
    });

    it("Should not allow minting outside the time frame", async function () {
      const tokenURI = "ipfs://test-token-uri";

      // Fast forward time to after the end time
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");

      await expect(
        nftCollection.connect(addr1).mint(addr1.address, tokenURI, { value: mintPrice })
      ).to.be.revertedWith("Minting not active");
    });

    it("Should not allow minting with insufficient funds", async function () {
      const tokenURI = "ipfs://test-token-uri";
      const insufficientFunds = ethers.utils.parseEther("0.05"); // 0.05 ETH

      await expect(
        nftCollection.connect(addr1).mint(addr1.address, tokenURI, { value: insufficientFunds })
      ).to.be.revertedWith("Insufficient funds");
    });

    it("Should not allow minting beyond max supply", async function () {
      const tokenURI = "ipfs://test-token-uri";

      // Mint up to max supply
      for (let i = 0; i < maxSupply; i++) {
        await nftCollection.connect(addr1).mint(addr1.address, tokenURI, { value: mintPrice });
      }

      // Attempt to mint beyond max supply
      await expect(
        nftCollection.connect(addr1).mint(addr1.address, tokenURI, { value: mintPrice })
      ).to.be.revertedWith("Max supply reached");
    });
  });

  describe("Royalties", function () {
    it("Should set the correct royalties", async function () {
      const [receiver, royaltyAmount] = await nftCollection.royaltyInfo(0, ethers.utils.parseEther("1"));
      expect(receiver).to.equal(owner.address);
      expect(royaltyAmount).to.equal(ethers.utils.parseEther("0.05")); // 5% of 1 ETH
    });
  });
});
