const qrs=require('../Model/QrModel')
const qrcode=require('qrcode')
const { v4: uuidv4 } = require("uuid");
const palaces=require('../Model/PalaceModel')

exports.getqr=async (req,res)=>{
    try{
      const id=req.params.id

      if(!id){
        return res.status(400).json({message:"id not found"})
      }

      const qr=await qrs.findOne({palaceid:id}).populate('palaceid')

     if (!qr){
        return res.status({message : "qr not found" })
      }


      const qrimage=await qrcode.toDataURL(qr.code)

      res.status(200).json({_id:qr._id,code:qr.code,qrimage,activestatus:qr.activestatus})
    }
    catch(err){
        console.log(err);
        
       return res.status(500).json({message : "internal server error"})
    }
}

exports.genratenewqr =async (req,res)=>{
    try{
   const id=req.params.id

      if(!id){
        return res.status(400).json({message:"id not found"})
      }

      const qr=await qrs.findOne({palaceid:id}).populate('palaceid')
      const palace=await palaces.findById(id)

      const uniquecode=uuidv4()
      const qrcode=uniquecode+palace?.name;

      if (qr){
         await qrs.findOneAndUpdate({palaceid:id},{code:qrcode})
      }
      else {
        await qrs.create({code:qrcode,palaceid:palace._id})
      }

      res.status(200).json({message : "qr regenrated successfully"})
    }
    catch(err){
        console.log(err);
        
      return res.status(500).json({message:"internal server error"})
    }
}

exports.deactivate =async (req,res)=>{
    try{
   const id=req.params.id

      if(!id){
        return res.status(400).json({message:"id not found"})
      }

      const qr=await qrs.findOne({_id:id}).populate('palaceid')

      if (!qr){
        return res.status({message : "qr not found" })
      }
      
      const response=await qrs.findByIdAndUpdate(id,{activestatus:false})
      res.status(200).json({message : "deactivated successfully"})
      
    }
    catch(err){
        console.log(err);
        
      return res.status(500).json({message:"internal server error"})
    }
}

exports.activate =async (req,res)=>{
    try{
   const id=req.params.id

      if(!id){
        return res.status(400).json({message:"id not found"})
      }

      const qr=await qrs.findOne({_id:id}).populate('palaceid')

      if (!qr){
        return res.status({message : "qr not found" })
      }
      
      const response=await qrs.findByIdAndUpdate(id,{activestatus:true})
      res.status(200).json({message : "restored successfully"})
      
    }
    catch(err){
      return res.status(500).json({message:"internal server error"})
    }
}

exports.delete =async (req,res)=>{
    try{
   const id=req.params.id

      if(!id){
        return res.status(400).json({message:"id not found"})
      }

      const qr=await qrs.findOne({_id:id}).populate('palaceid')

      if (!qr){
        return res.status(404).json({message : "qr not found" })
      }
      
      const response=await qrs.findByIdAndDelete(id)
      res.status(200).json({message : "Deleted successfully"})
      
    }
    catch(err){
      return res.status(500).json({message:"internal server error"})
    }
}
