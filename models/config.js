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
  clientID:key.id,
  clientSecret:key.secret,
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