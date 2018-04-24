var express=require("express");
var passport=require("passport");
var session=require("express-session");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose=require("mongoose");
var cors=require("cors");
require("./models/config.js");
mongoose.Promise=global.Promise;
mongoose.connect('mongodb://localhost:27017/auth3');

var userData=require("./models/database.js");

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
app.get("/auth/google",passport.authenticate("google",{scope:['profile','email']}));
app.get('/auth/google/callback', 
passport.authenticate('google', { successRedirect: '/show',
                                    failureRedirect: '/log' }));
app.get("/add",function(req,res){
 var insert=new userData();
 insert.username="pp";
 insert.password="pp";
 insert.save();
 res.send("1");
});
app.get("/show",function(req,res){
res.send("1");
});
app.listen("3000");
