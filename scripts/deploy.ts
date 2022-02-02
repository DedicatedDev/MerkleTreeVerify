// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { SimpleRewardDistributor__factory } from "./../typechain/factories/SimpleRewardDistributor__factory";
import { SimpleRewardDistributor } from "./../typechain/SimpleRewardDistributor.d";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import MerkleTree from "merkletreejs";
import keccak256 from "keccak256";


async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  //const Greeter = await ethers.getContractFactory("Greeter");
  //const greeter = await Greeter.deploy("Hello, Hardhat!");

  let SimpleRewardDistributor: SimpleRewardDistributor__factory;
  let simpleRewordDistributor: SimpleRewardDistributor;
  let token_address = "0x5179935322Ca6F098cba068d9bd4c83Bcbc58798";

  let userGroup: SignerWithAddress[] = [];
  const userLeafGroup: string[] = [];

  userGroup = await ethers.getSigners();
  let index: number = 0;

  userGroup.forEach((user) => {
    const leaf = ethers.utils.solidityKeccak256(
      ["uint", "address", "uint"],
      [index, user.address, 100000]
    ); //soliditySha3(index, user.address, 100000) ?? "";
    userLeafGroup.push(leaf);
    index += 1;
  });

  const merkleTree = new MerkleTree(userLeafGroup, keccak256, {
    sort: true
  });
  const root = merkleTree.getHexRoot();
   SimpleRewardDistributor = await ethers.getContractFactory(
     "SimpleRewardDistributor"
   );
   simpleRewordDistributor = await SimpleRewardDistributor.deploy(
     token_address,
     root
   );
   await simpleRewordDistributor.deployed();
   console.log(simpleRewordDistributor.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
