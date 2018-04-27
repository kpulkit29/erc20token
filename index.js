var express=require("express");
var passport=require("passport");
var session=require("express-session");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose=require("mongoose");
var speakeasy=require("speakeasy");
var cors=require("cors");
const Web3 = require('web3');
const fs = require('fs');
const solc = require('solc');
require("./models/config.js");
mongoose.Promise=global.Promise;
//change this instance
mongoose.connect('mongodb://localhost:27017/newgen2');

var userData=require("./models/database.js");
var adminData=require("./models/admin.js");
var app=express();
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(session({
  secret: 'secret1234',
  saveUninitialized: true,
  resave: true
}));
app.use(passport.initialize());
app.use(passport.session()); 
app.use(express.static(__dirname+"/client/public"));
app.all('/*', function(req, res, next) {
  next();
});
app.get("/",function(req,res){
  res.sendFile(__dirname+"/client/index.html");
});
app.get("/log",(req,res)=>{
  console.log("yes");
  res.header("Access-Control-Allow-Origin", "*");
  res.send("0");
});
app.get("/add",function(req,res){
  var secret = speakeasy.generateSecret({length: 20});
  console.log(secret.base32);
 var insert=new userData();
 insert.email=req.query.email;
 insert.password=req.query.pass;
 insert.secret=secret.base32;
 insert.save();
 res.send(secret.base32);
});
app.get("/check",function(req,res){
userData.findOne({$and:[{"email":req.query.email},{"password":req.query.pass}]},function(err,doc){
  if(err) throw err;
  if(doc) {
    console.log(doc.secret);
    console.log(req.query.sec);
    if(doc.secret==req.query.sec){
      res.send("1");
    }
    else res.send("0");
  }
  if(!doc) res.send("0");
});
});
app.get("/list",(req,res)=>{
  userData.find({},(err,doc)=>{
  console.log(doc);
  })
});
app.get("/checkAdmin",function(req,res){
      adminData.findOne({$and:[{"email":req.query.email},{"password":req.query.pass},{"flag":"1"}]},function(err,doc){
    
      if(err) throw err;
      if(doc) {
       console.log(doc);
       res.send("1");  
    }
      if(!doc) res.send("0");
    });
    });

//to add current user to admin status
app.get("/changeUserFlag",function(req,res){
  adminData.findOne({$and:[{"email":req.query.email},{"password":req.query.pass},{"flag":"1"}]},(err,doc)=>{
      if(err) throw doc;
      if(!doc) res.send("0");
      if(doc){
        userData.findOne({"email":req.query.user},(err,doc2)=>{
            if(err) throw doc;
            if(!doc2) res.send("0")
            if(doc2){
                var insert=new adminData();
                insert.email=req.query.user;
                insert.password=doc2.password;
                insert.flag="1";
                insert.save();
                res.send("1");
            }
        })
      }
      
  })
})
app.get("/addAdmin",(req,res)=>{
    var insert=new adminData();
    insert.email=req.query.email;
    insert.password=req.query.pass;
    insert.flag="1";
    insert.save();
    res.send("1");
})
app.get("/deploy",(req,res)=>{
  let web3 = new Web3();
  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
  } else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }
  
  if(!web3.isConnected()){
      throw new Error('unable to connect to ethereum node ');
  }else{
      console.log('connected to ehterum node at');
      let coinbase = web3.eth.coinbase;
      console.log('coinbase:' + coinbase);
      let balance = web3.eth.getBalance(coinbase);
      console.log('balance:' + web3.fromWei(balance, 'ether') + " ETH");
      let accounts = web3.eth.accounts;
      console.log(accounts);
      
      if (web3.personal.unlockAccount(web3.eth.accounts[0], 'user')) {
          console.log(`${web3.eth.accounts[0]} is unlocaked`);
      }else{
          console.log(`unlock failed, ${address}`);
      }
  }
  
  /*
  * Compile Contract and Fetch ABI
  */ 
  let source = fs.readFileSync("./contracts/BasicToken.sol", 'utf8');
  
  console.log('compiling contract...');
  let compiledContract = solc.compile(source);
  console.log('done');
  
  for (let contractName in compiledContract.contracts) {
      // code and ABI that are needed by web3 
      // console.log(contractName + ': ' + compiledContract.contracts[contractName].bytecode);
      // console.log(contractName + '; ' + JSON.parse(compiledContract.contracts[contractName].interface));
      var bytecode = compiledContract.contracts[contractName].bytecode;
      var abi = JSON.parse(compiledContract.contracts[contractName].interface);
  }
  
  console.log(JSON.stringify(abi, undefined, 2));
  
  /*
  * deploy contract
  */ 
  let gasEstimate = web3.eth.estimateGas({data: '0x' + bytecode});
  console.log('gasEstimate = ' + gasEstimate);
  let MyContract = web3.eth.contract(abi);
  console.log('deploying contract...');
  let myContractReturned = MyContract.new( {
      from: address,
      data: '0x'+ bytecode,
      gas: gasEstimate + 50000
  }, function (err, myContract) {
      if (!err) {
          // NOTE: The callback will fire twice!
          // Once the contract has the transactionHash property set and once its deployed on an address.
  
          // e.g. check tx hash on the first call (transaction send)
          if (!myContract.address) {
              console.log(`myContract.transactionHash = ${myContract.transactionHash}`); // The hash of the transaction, which deploys the contract
  
          // check address on the second call (contract deployed)
          } else {
              console.log(`myContract.address = ${myContract.address}`); // the contract address
              global.contractAddress = myContract.address;
          }
  
          // Note that the returned "myContractReturned" === "myContract",
          // so the returned "myContractReturned" object will also get the address set.
      } else {
          console.log(err);
      }
  });
  
  
  (function wait () {
      setTimeout(wait, 1000);
  })();
})
app.listen("3000");