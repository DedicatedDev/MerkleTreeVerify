import { TestTokenWithNameAndSymbol } from "./../typechain/TestTokenWithNameAndSymbol.d";
import { TestTokenWithNameAndSymbol__factory } from "./../typechain/factories/TestTokenWithNameAndSymbol__factory";
import { SimpleRewardDistributor } from "./../typechain/SimpleRewardDistributor.d";
import { SimpleRewardDistributor__factory } from "./../typechain/factories/SimpleRewardDistributor__factory";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import MerkleTree from "merkletreejs";
import keccak256 from "keccak256";

describe("SimpleDistributor test", async () => {
  const tokenAddress = "0x5179935322Ca6F098cba068d9bd4c83Bcbc58798";
  let userGroup: SignerWithAddress[] = [];
  const userLeafGroup: string[] = [];
  let merkleTree: MerkleTree;
  let root: string;
  let Token: TestTokenWithNameAndSymbol__factory;
  let token: TestTokenWithNameAndSymbol;
  let SimpleRewardDistributor: SimpleRewardDistributor__factory;
  let simpleRewordDistributor: SimpleRewardDistributor;

  before(async function () {
    userGroup = await ethers.getSigners();

    let index: number = 0;

    userGroup.forEach((user) => {
      const leaf = ethers.utils.solidityKeccak256(
        ["uint", "address", "uint"],
        [index, user.address, 10000]
      ); //soliditySha3(index, user.address, 100000) ?? "";
      userLeafGroup.push(leaf);
      index += 1;
    });

    merkleTree = new MerkleTree(userLeafGroup, keccak256, {
      sort: true
    });

    root = merkleTree.getHexRoot();

    console.log("init Root =>", root);
  });

  it("should be deployed token cnotract", async () => {
    Token = await ethers.getContractFactory("TestTokenWithNameAndSymbol");
    token = await Token.deploy(100000000, "ETH", "ETH");
    await token.deployed();
    console.log("token contract address:=>", token.address);
  });

  it("should be deployed Distributor", async () => {
    SimpleRewardDistributor = await ethers.getContractFactory(
      "SimpleRewardDistributor"
    );
    simpleRewordDistributor = await SimpleRewardDistributor.deploy(
      token.address,
      root
    );
    await simpleRewordDistributor.deployed();

    token.mint(simpleRewordDistributor.address, 1000000);
    const balance = await simpleRewordDistributor.balanceof();
    console.log("constract address:=>", simpleRewordDistributor.address);
    console.log("constract balance:=>", balance);
  });

  it("should be claim test", async () => {
    const proof = merkleTree.getHexProof(userLeafGroup[2]);
    console.log("proof:=>", proof);
    // Off chain verification
    const isVerified = merkleTree.verify(proof, userLeafGroup[2], root);
    expect(isVerified).to.equal(true);

    const mainRoot = await simpleRewordDistributor.checkMainRoot(
      2,
      userGroup[2].address,
      10000,
      proof
    );

    console.log("MainRoot =>", mainRoot);

    await expect(
      simpleRewordDistributor.claim(2, userGroup[2].address, 10000, proof)
    )
      .to.emit(simpleRewordDistributor, "Claimed")
      .withArgs(2, userGroup[2].address, 10000);
  });
});
