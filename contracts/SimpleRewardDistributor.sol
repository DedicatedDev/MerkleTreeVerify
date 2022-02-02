//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "hardhat/console.sol";

contract SimpleRewardDistributor {
    event Claimed(uint256 index, address account, uint256 amount);
    event Node(bytes32[] node);

    address public immutable token;
    bytes32 public immutable merkleRoot;

    // This is a packed array of booleans.
    mapping(uint256 => bool) private claimedMap;

    constructor(address token_, bytes32 merkleRoot_) public {
        token = token_;
        merkleRoot = merkleRoot_;
    }

    function isClaimed(uint256 index) public view returns (bool) {
        return claimedMap[index];
    }

    function _setClaimed(uint256 index) private {
        claimedMap[index] = true;
    }

    function claim(uint256 index, address account, uint256 amount, bytes32[] calldata merkleProof) external {
        require(!isClaimed(index), 'MerkleDistributor: Drop already claimed.');
        
        // Verify the merkle proof.
        bytes32 node = keccak256(abi.encodePacked(index, account, amount));
        //emit Node(merkleProof);
    
        require(MerkleProof.verify(merkleProof, merkleRoot, node), 'MerkleDistributor: Invalid proof.');
        // Mark it claimed and send the token.
        _setClaimed(index);
        require(IERC20(token).transfer(account, amount), 'MerkleDistributor: Transfer failed.');
        emit Claimed(index, account, amount);
    }

    function balanceof() public view  returns(uint256 balance_) {
        balance_ = IERC20(token).balanceOf(msg.sender);
    }

    function checkMainRoot(uint256 index, address account, uint256 amount, bytes32[] calldata merkleProof) external view returns(bytes32) {
        bytes32 node = keccak256(abi.encodePacked(index, account, amount));
        return MerkleProof.processProof(merkleProof, node);
    }
}