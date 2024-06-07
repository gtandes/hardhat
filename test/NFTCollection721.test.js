const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTCollection721", function () {
  let NFTCollection721;
  let nftCollection;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  const name = "My NFT Collection";
  const symbol = "MNFT";
  const description = "This is a description";
  const maxSupply = 100;
  const royaltyReceiver = "0x0000000000000000000000000000000000000001";
  const royaltyFeeNumerator = 500; // 5%

  beforeEach(async function () {
    NFTCollection721 = await ethers.getContractFactory("NFTCollection721");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    nftCollection = await NFTCollection721.deploy();
    await nftCollection.waitForDeployment();
    await nftCollection.initialize(
      name,
      symbol,
      description,
      maxSupply,
      royaltyReceiver,
      royaltyFeeNumerator
    );
  });

  describe("Initialization", function () {
    it("Should set the right owner", async function () {
      expect(await nftCollection.owner()).to.equal(owner.address);
    });

    it("Should set the right name, symbol, and description", async function () {
      expect(await nftCollection.name()).to.equal(name);
      expect(await nftCollection.symbol()).to.equal(symbol);
      expect(await nftCollection.description()).to.equal(description);
    });

    it("Should set the right maxSupply and totalMinted", async function () {
      expect(await nftCollection.maxSupply()).to.equal(maxSupply);
      expect(await nftCollection.totalMinted()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should mint a token and update totalMinted", async function () {
      const tokenId = 1;
      const tokenURI = "https://example.com/token/1";

      await nftCollection.mint(owner.address, tokenId, tokenURI);
      expect(await nftCollection.totalMinted()).to.equal(1);

      const uri = await nftCollection.tokenURI(tokenId);
      expect(uri).to.equal(tokenURI);
    });

    it("Should revert if minting exceeds maxSupply", async function () {
      for (let i = 1; i <= maxSupply; i++) {
        await nftCollection.mint(owner.address, i, `https://example.com/token/${i}`);
      }

      await expect(
        nftCollection.mint(owner.address, maxSupply + 1, "https://example.com/token/101")
      ).to.be.revertedWith("NFTCollection721: Exceeds max supply");
    });
  });

  describe("Token Sale", function () {
    it("Should set token sale price", async function () {
      const tokenId = 1;
      const price = ethers.parseEther("1"); // 1 Ether

      await nftCollection.mint(owner.address, tokenId, "https://example.com/token/1");
      await nftCollection.setTokenSalePrice(tokenId, price);
      expect(await nftCollection.tokenSalePrice(tokenId)).to.equal(price);
    });

    it("Should revert if token sale price is out of bounds", async function () {
      const tokenId = 1;
      const price = ethers.parseEther("300"); // 300 Ether

      await nftCollection.mint(owner.address, tokenId, "https://example.com/token/1");

      await expect(
        nftCollection.setTokenSalePrice(tokenId, price)
      ).to.be.revertedWith(
        "NFTCollection721: Sale price must be between 0 and 250 Ether (equivalent to $1,000,000 at $4,000/Ether)"
      );
    });

    it("Should set token for sale", async function () {
      const tokenId = 1;
      const forSale = true;
      const startTime = Math.floor(Date.now() / 1000); // Current time
      const endTime = startTime + 3600; // One hour later

      await nftCollection.mint(owner.address, tokenId, "https://example.com/token/1");
      await nftCollection.setTokenForSale(tokenId, forSale, startTime, endTime);

      expect(await nftCollection.tokenForSale(tokenId)).to.equal(forSale);
      expect(await nftCollection.listingStartTime(tokenId)).to.equal(startTime);
      expect(await nftCollection.listingEndTime(tokenId)).to.equal(endTime);
    });

    it("Should return true if token is for sale", async function () {
      const tokenId = 1;
      const forSale = true;
      const startTime = Math.floor(Date.now() / 1000); // Current time
      const endTime = startTime + 3600; // One hour later

      await nftCollection.mint(owner.address, tokenId, "https://example.com/token/1");
      await nftCollection.setTokenForSale(tokenId, forSale, startTime, endTime);

      expect(await nftCollection.isTokenForSale(tokenId)).to.equal(true);
    });

    it("Should return false if token is not for sale", async function () {
      const tokenId = 1;

      await nftCollection.mint(owner.address, tokenId, "https://example.com/token/1");

      expect(await nftCollection.isTokenForSale(tokenId)).to.equal(false);
    });
  });
});
