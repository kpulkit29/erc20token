var passport=require("passport");
var key=require("./key.js");
var GoogleStrategy=require("passport-google-oauth20").Strategy;
var userData=require("./database.js");
passport.serializeUser((user,done)=>{
 done(null,user.id);
});
passport.deserializeUser((id,done)=>{
  userData.findById(id,function(err,user){
   done(null,user);
  });
});
passport.use(new GoogleStrategy({
  clientID:"772870075208-b410o1v9m7d26fptgtd5804ag9u6ogml.apps.googleusercontent.com",
  clientSecret:"lny6g4PZQFUwlqG6wYiVMWbc",
  callbackURL:"/auth/google/callback"
},(token,rtoken,profile,done)=>{
  userData.findOne({googleid:profile.id}).then((e_user)=>{
    console.log(e_user);
    if(e_user){
done(null,e_user);
    }
    else{
      new userData({googleid:profile.id}).save().then((user)=>{
         done(null,user);
      });
    }
  });
}));