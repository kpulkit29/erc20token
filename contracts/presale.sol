pragma solidity ^0.4.18;
contract AssetToken{
    function transfer(address to, uint tokens) public returns (bool success);
    function change(bytes32 new_state) public ;
}
contract preico {
     function tokensFromPresale(uint tokens) external;
}
contract presale{
    address private _owner;
    ////modifiers///
    //to check if ether is not in fraction
       modifier inMultipleOfPrice() {
        require(msg.value%priceInWei == 0) ;
        _;
    }
       modifier inState(State _state) {
        require(state == _state) ;
        _;
    }
    modifier isCreator() {
        require(msg.sender == _owner) ;
        _;
    }
    ////////////
       enum State {
        Fundraising,
        Failed,
        Successful,
        Closed
    }
    State public state = State.Fundraising;

    struct Contribution {
        uint amount;
        address contributor;
    }
    Contribution[] contributions;
   //the presale constraints
   //1 ETH=12500 WGT
    uint public totalRaised;
    uint public currentBalance=0;
    uint public deadline=now+3 weeks;
    uint public priceInWei=1 ether;
    uint public MaximumAvailable = 70000000 ;
    address public tokenAdd;
    address public tokenAddPreico;
    address private beneficiary;
    ///functions///
    function presale(address _benefiary) public {
        _owner=msg.sender;
        beneficiary=_benefiary;
    }
    
    //////the contribute function through which user contribtes
    function contribute()
    public
    inState(State.Fundraising) payable
    {
        require(tokenAdd>0x0);
        contributions.push(
            Contribution({
                amount: msg.value,
                contributor: msg.sender
                }) 
            );

        totalRaised += (msg.value/priceInWei)*12500;
        currentBalance = totalRaised;
        AssetToken(tokenAdd).transfer(msg.sender,(msg.value/priceInWei)*12500);
        checkCondition();
    }
       function checkCondition() public {
        
       
        if (totalRaised >= MaximumAvailable) {
            state = State.Successful;
           payOut();
            } else if ( now > deadline )  {
                
                     state = State.Successful;
                    // LogFundingSuccessful(totalRaised);
                     //a way to transfer to oteher contract
                     if(totalRaised<MaximumAvailable){
                         preico(tokenAddPreico).tokensFromPresale(MaximumAvailable-totalRaised);
                     }
                     payOut();  
                    // completedAt = now;
                
            } 
        
    }
    
    function payOut()
        public
        inState(State.Successful)
        {
            if(!beneficiary.send(this.balance)) {
                revert();
            }
            state = State.Closed;
            currentBalance = 0;
        }
    function addDetail(address _token,address preicoToken) isCreator() public {
        tokenAdd=_token;
        tokenAddPreico=preicoToken;
    }
    function totalRaised() public view returns (uint256) {
        return totalRaised;
    } 
    function changeStateOfIco(bytes32 NewState) public isCreator() {
        AssetToken(tokenAdd).change(NewState);
    }
}