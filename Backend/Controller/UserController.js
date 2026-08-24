const users=require('../Model/UserModel')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const moment=require('moment')

exports.singup=async (req,res)=>{
    try{
        const {name,email,phone,password,role}=req.body

        if(!(name && phone && password)){
          return  res.status(400).json({message : "bad request all field required"})
        }

        const existing=await users.findOne({email})
        if(existing){
          return res.status(409).json({message: "user already exist"})
        }

        const salt=bcrypt.genSaltSync(10)
        const hashpass= bcrypt.hashSync(password,salt)
   
        const data={name,email,phone,password:hashpass,role}
        const result=await users.create(data)
        return res.status(201).json({message:"singup successfully"})

    }
    catch(err){
    console.log(err);
    
      return res.status(500).json({message :"internal server error",err})
    }
}

exports.login=async (req,res)=>{
    try{
       const {email,password}=req.body;
       
       if(!(email && password)){
       return res.status(400).json({message:"bad request all field required"})
       }

       const user=await users.findOne({email})

       if(!user){
        return res.status(404).json({message:"user not found"})
       }

       const match=bcrypt.compareSync(password,user.password)

       if(!match){
         return res.status(401).json({message:"wrong password"})   
       }

       const token=jwt.sign({email},process.env.jwtsecretkey,{expiresIn:"1d"})
       return res.status(200).json({message: "login succesfully",user,token})
    }
    catch(err){
       return res.status(500).json({message:'internal server error',err})
    }
}

exports.forgetpass=async (req,res)=>{
    try{
       const {email,newPassword}=req.body
       

       if(!(email && newPassword)){
        return res.status(400).json({message:"bad request email is missing"})
       }

       
       const user=await users.findOne({email})
       
       if(!user){
           return res.status(404).json({message : "user not found"})
        }
   

       const salt=bcrypt.genSaltSync(10)
       const hashpass= bcrypt.hashSync(newPassword,salt)

       const result=await users.findOneAndUpdate({email},{password:hashpass})
       return res.status(200).json({message:"password change successfully"})

    }
    catch(err){
        console.log(err);
        
     return res.status(500).json({message:"internal server error",err})
    }
}

exports.resetpass=async (req,res)=>{
    try{
        const {oldPassword,newPassword}=req.body;
        const {email}=req.user

        if(!(email,oldPassword,newPassword)){
            return res.status(400).json({message:"bad request all field required"})
        }

       const user=await users.findOne({email})
       if(!user){
           return res.status(404).json({message:"user not found"})
       }

       const match=bcrypt.compareSync(oldPassword,user.password)
       if(!match){
         return res.status(403).json({message:"old password not match"})
       }
       
       const same=bcrypt.compareSync(newPassword,user.password)
       if(same){
        return res.status(409).json({message:"new password cannot be same"})
       }
       
      const salt=bcrypt.genSaltSync(10)
       const hashpass= bcrypt.hashSync(newPassword,salt)

       const result=await users.findOneAndUpdate({email},{password:hashpass})
       return res.status(200).json({message:"password change successfully"})

    }
    catch(err){
        console.log(err);
        
      return res.status(500).json({message:"internal server error"})
    }
}


const sendmail=require('../Utils/helper')
const htmltemplate=require('../Utils/HtmlTemplate')
exports.forgetotpsend=async (req,res)=>{
    try{
        const {email}=req.body
        
        if(!(email)){
            return res.status(404).json({message:"all keys are required"})
        }

        const user=await users.findOne({email})

        if(!user) {
            return res.status(404).json({message:"user not found"})
        }
       
        const otpgen=require('../Utils/OtpGen')
        const otp=otpgen()
        const saveotp=await users.findOneAndUpdate({email},{
            otp:otp,
            otpexpire:moment().add(10, 'minutes')
        })

        
        const mailid=await sendmail.mailsend(email,'otp for password forget',htmltemplate.forgetotp(user.name,otp))
        
        if(mailid){
            return res.status(200).json({message:"mail send successfully"})
        }
        else{
            return res.status(400).json({message:"mail send failed"})
        }

    }
    catch(err){
      console.log(err);
      
        return res.status(500).json({message:"internal server error"})
    }
}

exports.forgetotpverify=async(req,res)=>{
    try{
       const {email,otp}=req.body

    if(!(email && otp)){
            return res.status(404).json({message:"all keys are required"})
        }

        const user=await users.findOne({email})

        if(!user) {
            return res.status(404).json({message:"user not found"})
        }

       if(Number(otp) === user.otp && moment().isSameOrBefore(user.otpexpire)){
         await user.findOneAndUpdate({ email }, { otp: null, otpexpire: null });
         return res.status(200).json({ message: "Code verify" });
       }
       else if (user.otp !== Number(otp)) {
        return res.status(401).json({ message: "wrong code" });
      }
       else {
        await user.findOneAndUpdate({ email }, { otp: null, otpexpire: null });
        return res.status(403).json({ message: "Code expire" });
      }
    }
    catch(err){
    return res.status(500).json({message:"internal server error"})
    } 
}


exports.changetheme = async (req, res) => {
  try {
    const { theme } = req.body;
    const { email } = req.user;

    const result = await users.findOne({ email });
    if (!result) {
      return res.status(404).json({ message: "user not found" });
    } else {
      const updated = await users.findOneAndUpdate({ email }, {theme: theme });

      return res.status(200).json({ message: "changed successfully", updated });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
