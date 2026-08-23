const mongoose=require('mongoose')

const Adminschema=mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true
    },
    email:{
        type:String,
        trim:true,
        required:true,
        unique:true
    },
    phone:{
        type:Number,
        trim:true,
        required:true,
    },
    address:{
        type:String,
        trim:true,
        required:true
    },
    aadharno:{
       type:Number,
       trim:true,
       required:true
    },
    activestatus:{
        type:Boolean,
        default:false
    },
    approvestatus:{
        type:String,
        enum:['pending','approved','cancelled'],
        default:'pending'
    },
    checkid: {
      type: String,
      default: null,
    },
    areaid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"areas",
        required:true
    },
    profileimage:{
       type:String,
       required:true
    },
    otp:{
        type:Number,
        default:null
    },
    otpexpire:{
        type:Date,
        default:null
    }
},
{timestamps:true,
 versionkey:false   
})

module.exports=mongoose.model("admins",Adminschema)