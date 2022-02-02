import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import MerkleTree from "merkletreejs";
import keccak256 from "keccak256";
import { rinkebyId, accountPrivatekey } from "../config";



describe("Original Contract Test", async () => {
  let provider = new ethers.providers.InfuraProvider(
    "rinkeby",
    "09a90a30e7df4e318393c6db0636793b"
  );

  let wallet = new ethers.Wallet(accountPrivatekey, provider);
  let abi = [
    {
      inputs: [
        { internalType: "address", name: "token_", type: "address" },
        { internalType: "bytes32", name: "merkleRoot_", type: "bytes32" }
      ],
      stateMutability: "nonpayable",
      type: "constructor"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "index",
          type: "uint256"
        },
        {
          indexed: false,
          internalType: "address",
          name: "account",
          type: "address"
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256"
        }
      ],
      name: "Claimed",
      type: "event"
    },
    {
      inputs: [
        { internalType: "uint256", name: "index", type: "uint256" },
        { internalType: "address", name: "account", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
        { internalType: "bytes32[]", name: "merkleProof", type: "bytes32[]" }
      ],
      name: "claim",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
      name: "isClaimed",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "merkleRoot",
      outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "token",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function"
    }
  ];
  let contractAddress = "0x60d4663A0874cAa6CF7504f8c93e8cac9A60A83a";
  let contract = new ethers.Contract(contractAddress, abi, provider);
  
  let userGroup: SignerWithAddress[] = [];
  const userLeafGroup: string[] = [];
  let merkleTree: MerkleTree;
  let root: string;

  before(async function () {
    userGroup = await ethers.getSigners();
    let index: number = 0;
    userGroup.forEach((user) => {
      const leaf = ethers.utils.solidityKeccak256(
        ["uint", "address", "uint"],
        [index, user.address, 1]
      ); 
      userLeafGroup.push(leaf);
      index += 1;
    });

    merkleTree = new MerkleTree(userLeafGroup, keccak256, {
      sort: true
    });

    root = merkleTree.getHexRoot();

    console.log("init Root =>", root);
  });


  it("should be claim test in original contract", async () => {
    const proof = merkleTree.getHexProof(userLeafGroup[2]);
    console.log("proof:=>", proof);
    // Off chain verification
    const isVerified = merkleTree.verify(proof, userLeafGroup[2], root);
    expect(isVerified).to.equal(true);
    await expect(
      contract.connect(wallet).claim(2, userGroup[2].address, 1, proof,{
          gasLimit:1000000,
          nonce:800
      })
    )
      .to.emit(contract, "Claimed")
      .withArgs(2, userGroup[2].address, 1);
  });
});
