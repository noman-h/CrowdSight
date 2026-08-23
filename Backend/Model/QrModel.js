const mongoose=require('mongoose')

const qrschema=mongoose.Schema({
    code:{
       type:String,
       required:true
    },
    palaceid:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    activestatus:{
    type:Boolean,
    default:true
    }
},
{
    timestamps:true,
    versionkey:false
})

module.exports=mongoose.model('qrs',qrschema)