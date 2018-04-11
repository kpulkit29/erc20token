pragma solidity ^0.4.17;
//erc20 interface
import "./safe.sol";
contract ERC20Interface {
  function totalSupply() public constant returns (uint);
    function balanceOf(address tokenOwner) public constant returns (uint balance);
    function allowance(address tokenOwner, address spender) public constant returns (uint remaining);
    function transfer(address to, uint tokens) public returns (bool success);
    function approve(address spender, uint tokens) public returns (bool success);
    function transferFrom(address from, address to, uint tokens) public returns (bool success);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
    event Transfer(address indexed from, address indexed to, uint tokens);
}
//pre-sale for the wgt tokens
contract TokenManager is ERC20Interface,SafeMath {
    string public symbol;
    string public  name;
    uint8 public decimals;
    uint public _totalSupply;
    uint currentStateSupply;
    string state;
    address private owner;
    modifier onlyAdmin(){
       require(msg.sender==owner);
       _;
    }
    mapping(address => uint) balances;
    mapping (address => mapping (address => uint256)) allowed;
    function TokenManager(){
        name="WGT token";
        decimals=18;
        symbol="WGT";
        _totalSupply=1000000000;
        owner=msg.sender;
        balances[msg.sender]=_totalSupply;
    }
    function setStage(string currStage){
        state=currStage;
    }
    function balanceOf(address tokenOwner) public constant returns (uint balance) {
        return balances[tokenOwner];
    }
    function totalSupply() public constant returns (uint){
        return currentStateSupply;
    }
    function transfer(address to, uint tokens) public returns (bool success) {
        require(balances[msg.sender]>tokens);
        balances[msg.sender] = safeSub(balances[msg.sender], tokens);
        balances[to] = safeAdd(balances[to], tokens);
        Transfer(msg.sender, to, tokens);
        return true;
    }
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        //same as above. Replace this line with the following if you want to protect against wrapping uints.
        //if (balances[_from] >= _value && allowed[_from][msg.sender] >= _value && balances[_to] + _value > balances[_to]) {
        if (balances[_from] >= _value && allowed[_from][msg.sender] >= _value && _value > 0) {
            balances[_to] += _value;
            balances[_from] -= _value;
            allowed[_from][msg.sender] -= _value;
            Transfer(_from, _to, _value);
            return true;
        } else { return false; }
    }
     function approve(address _spender, uint256 _value) public returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) public constant returns (uint256 remaining) {
      return allowed[_owner][_spender];
    }
    
}
