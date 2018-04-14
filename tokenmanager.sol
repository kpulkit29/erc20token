pragma solidity ^0.4.18;

contract SafeMath {
    function safeAdd(uint a, uint b) public pure returns (uint c) {
        c = a + b;
        require(c >= a);
    }
    function safeSub(uint a, uint b) public pure returns (uint c) {
        require(b <= a);
        c = a - b;
    }
    function safeMul(uint a, uint b) public pure returns (uint c) {
        c = a * b;
        require(a == 0 || c / a == b);
    }
    function safeDiv(uint a, uint b) public pure returns (uint c) {
        require(b > 0);
        c = a / b;
    }
}


contract ERC20Interface {
    function totalSupply() public constant returns (uint);
    function balanceOf(address tokenOwner) public constant returns (uint balance);
    function allowance(address tokenOwner, address spender) public constant returns (uint remaining);
    function transfer(address to, uint tokens) public returns (bool success);
    function approve(address spender, uint tokens) public returns (bool success);
    function transferFrom(address from, address to, uint tokens) public returns (bool success);

    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}
contract Owned {
    address public owner;
    address public newOwner;

    event OwnershipTransferred(address indexed _from, address indexed _to);

    function Owned() public {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address _newOwner) public onlyOwner {
        newOwner = _newOwner;
    }
}
contract OurToken is  Owned, SafeMath {
    string public symbol;
    string public  name;
    uint8 public decimals;
    uint public _totalSupply;
    bytes32 public currStage="presale";
    address private teamAd;
    address private companyReserve;
    address public bonusStored;
    address public Bounty;
    mapping(address => uint) balances;
    mapping(address => mapping(address => uint)) allowed;
    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
    // ------------------------------------------------------------------------
    // Constructor
    // ------------------------------------------------------------------------
    function OurToken(address _companyReserve,address _teamAd,address _bonusStored,address _Bounty) public {
        symbol = "WGT";
        name = "WGT tokens";
        decimals = 18;
        _totalSupply = 1000000000;
        companyReserve=_companyReserve;
        teamAd=_teamAd;
        bonusStored=_bonusStored;
        Bounty=_Bounty;
        balances[msg.sender] = (60*(_totalSupply))/100;
        balances[_teamAd]=(15*(_totalSupply))/100;
        balances[_companyReserve]=(10*(_totalSupply))/100;
        balances[bonusStored]=(12*(_totalSupply))/100;
        balances[Bounty]=(12*(_totalSupply))/100;
        Transfer(address(0),msg.sender, _totalSupply);
    }

    function totalSupply() public constant returns (uint) {
        return _totalSupply  - balances[owner];
    }


    // ------------------------------------------------------------------------
    // Get the token balance for account tokenOwner
    // ------------------------------------------------------------------------
    function balanceOf(address tokenOwner) public constant returns (uint balance) {
        return balances[tokenOwner];
    }


    // ------------------------------------------------------------------------
    // Transfer the balance from token owner's account to to account
    // - Owner's account must have sufficient balance to transfer
    // - 0 value transfers are allowed
    // ------------------------------------------------------------------------
    function transfer(address to, uint tokens) public returns (bool success) {
        balances[msg.sender] = safeSub(balances[msg.sender], tokens);
        balances[to] = safeAdd(balances[to], tokens);
        Transfer(msg.sender, to, tokens);
        return true;
    }
    function approve(address spender, uint tokens) public returns (bool success) {
        allowed[msg.sender][spender] = tokens;
        Approval(msg.sender, spender, tokens);
        return true;
    }


    function transferFrom(address from, address to, uint tokens) public returns (bool success) {
        balances[from] = safeSub(balances[from], tokens);
        allowed[from][msg.sender] = safeSub(allowed[from][msg.sender], tokens);
        balances[to] = safeAdd(balances[to], tokens);
        Transfer(from, to, tokens);
        return true;
    }
    function allowance(address tokenOwner, address spender) public constant returns (uint remaining) {
        return allowed[tokenOwner][spender];
    }

    // function transferAnyERC20Token(address tokenAddress, uint tokens) public onlyOwner returns (bool success) {
    //     return ERC20Interface(tokenAddress).transfer(owner, tokens);
    // }
    // function addReservedShares() public {
        
    // }
}
contract AssestToken is OurToken{
      uint bonus;
      function AssestToken(address com,address _team,address _bonus,address _bounty) OurToken(com,_team,_bonus,_bounty) {
      }
      function transfer(address to, uint tokens) public returns (bool success) {
        if(currStage=="presale"){
        bonus=(35*balances[bonusStored])*100;
        balances[msg.sender] = safeSub(balances[msg.sender], tokens+bonus);
        balances[to] = safeAdd(balances[to], tokens+bonus);
        }
        if(currStage=="preico"){
        bonus=(25*balances[bonusStored])*100;
        balances[msg.sender] = safeSub(balances[msg.sender], tokens+bonus);
        balances[to] = safeAdd(balances[to], tokens+bonus);
        }
        
        Transfer(msg.sender, to, tokens);
        return true;
    }
    function change(bytes32 newS) onlyOwner() public{
        currStage=newS;
    }
}



