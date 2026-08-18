const mongoose=require('mongoose')

const palaceschema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
        areaid:{
           type:mongoose.Schema.Types.ObjectId,
           ref:"areas",
           required:true
        },

        address:{
            type:String,
            trim:true,
            lowercase:true
        },

        description:{
            type:String,
            trim:true,
            lowercase:true
        },

        activestatus:{
            type:Boolean,
            default:false
        },

        approvedstatus:{
            type:String,
            enum:["pending","approved","rejected"],
            default:"pending"
        },

        approvedby:{
            type:String,
            enum:["admin","superadmin"],
            default:null
        },

        qrcodeid:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"qrs",
            required:true,
            default:null
        },
        
        checkid: {
      type: String,
      default: null,
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
{
    timestamps:true,
    versionkey:false
})

module.exports=mongoose.model('palaces',palaceschema)