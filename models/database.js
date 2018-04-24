var mongoose=require("mongoose");
var Schema=mongoose.Schema;
userSchema=new Schema({
   googleid:String
});
var userData=mongoose.model("userData",userSchema);
module.exports=userData;
