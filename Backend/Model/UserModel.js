const mongoose=require('mongoose')

const userschema=mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
    },
    phone:{
        type:Number,
        trim:true,
        default:null
    },
    password:{
        type:String,
        required:true,
        trim:true
    },
    role:{
        type:String,
        enum:["superadmin","admin","palaceowner","user"],
        default:"user"
    },
    theme:{
       type:String,
       default:"light"
    },
    otp:{
        type:Number,
        default:null
    },
    otpexpire:{
        type:Date,
        default:null
    }
})

module.exports=mongoose.model('users',userschema)