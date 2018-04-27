var mongoose=require("mongoose");
var Schema=mongoose.Schema;
userSchema=new Schema({
   email:String,
   password:String,
   secret:String,
   flag:{type:String,default:"0"},
});

var userData=mongoose.model("userData",userSchema);
module.exports=userData;
