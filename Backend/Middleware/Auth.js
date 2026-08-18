const jwt=require('jsonwebtoken')
const users=require('../Model/UserModel')


module.exports=async (req,res,next)=>{
    
 try{
    const authtoken=req.headers.authorization

    if(!authtoken){
        return res.status(401).json({message : "unautenticate user"})
    }

    const token=authtoken.split(" ")[1]

    const decode=jwt.verify(token,process.env.jwtsecretkey)

    if (!decode){
        return res.status(401).json({message :"invalid token"})
    }

    const userdetail=await users.findOne({email:decode.email})

    if(!userdetail){
        return res.status(404).json({message : "user not found"})
    }

    req.user=userdetail;
    next()

 }
 catch (err){
    
      if (err.message === "jwt expired") {
      return res.status(401).json(err);
    }
   if (err.message === "jwt malformed") {
      return res.status(401).json(err);
    }
    
    return res.status(500).json({message : "internal server error",err})
 }
}