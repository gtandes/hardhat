const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTCollection1155", function () {
  let NFTCollection1155, nftCollection, owner, addr1, addr2;
  const mintPrice = ethers.utils.parseEther("0.1"); // 0.1 ETH
  const maxSupply = 100;
  const startTime = Math.floor(Date.now() / 1000); // current time
  const endTime = startTime + 3600; // 1 hour from now

  beforeEach(async function () {
    [owner, addr1, addr2, _] = await ethers.getSigners();

    NFTCollection1155 = await ethers.getContractFactory("NFTCollection1155");

    nftCollection = await NFTCollection1155.deploy();
    await nftCollection.deployed();
    await nftCollection.initialize(
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
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await nftCollection.owner()).to.equal(owner.address);
    });

    it("Should set the correct parameters", async function () {
      expect(await nftCollection.mintPrice()).to.equal(mintPrice);
      expect(await nftCollection.startTime()).to.equal(startTime);
      expect(await nftCollection.endTime()).to.equal(endTime);
      expect(await nftCollection.maxSupply()).to.equal(maxSupply);
      expect(await nftCollection.isCapped()).to.equal(true);
    });
  });

  describe("Minting", function () {
    it("Should allow minting within the time frame", async function () {
      const amount = 1;
      const data = "0x";
      await nftCollection.connect(addr1).mint(addr1.address, amount, data, { value: mintPrice });

      expect(await nftCollection.balanceOf(addr1.address, 0)).to.equal(amount);
    });

    it("Should not allow minting outside the time frame", async function () {
      const amount = 1;
      const data = "0x";

      // Fast forward time to after the end time
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");

      await expect(
        nftCollection.connect(addr1).mint(addr1.address, amount, data, { value: mintPrice })
      ).to.be.revertedWith("Minting not active");
    });

    it("Should not allow minting with insufficient funds", async function () {
      const amount = 1;
      const data = "0x";
      const insufficientFunds = ethers.utils.parseEther("0.05"); // 0.05 ETH

      await expect(
        nftCollection.connect(addr1).mint(addr1.address, amount, data, { value: insufficientFunds })
      ).to.be.revertedWith("Insufficient funds");
    });

    it("Should not allow minting beyond max supply", async function () {
      const amount = maxSupply + 1;
      const data = "0x";

      await expect(
        nftCollection.connect(addr1).mint(addr1.address, amount, data, { value: mintPrice.mul(amount) })
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
