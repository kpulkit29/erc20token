var mongoose=require("mongoose");
var Schema=mongoose.Schema;
adminSchema=new Schema({
   email:String,
   password:String,
   flag:{type:String,default:"1"},
});

var adminData=mongoose.model("adminData",adminSchema);
module.exports=adminData;
