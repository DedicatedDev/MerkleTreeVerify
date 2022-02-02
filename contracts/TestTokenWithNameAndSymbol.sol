pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
contract TestTokenWithNameAndSymbol is ERC20 {
    uint8 private _decimals;
    constructor(uint totalSupply, string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, totalSupply);
    }

    function setDecimalPlaces(uint8 decimals) public {
        _setupDecimals(decimals);
    }

    function _setupDecimals(uint8 decimals_) internal virtual {
        _decimals = decimals_;
    }

    function mint(address receiver, uint256 amount) external {
        _mint(receiver, amount);
    }
}