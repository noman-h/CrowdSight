const mongoose=require('mongoose')

const qrschema=mongoose.Schema({
    qrimage:{
        type:String,
        required:true
    },
    code:{
       type:String,
       required:true
    },
    palaceid:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    }
},
{
    timestamps:true,
    versionkey:false
})

module.exports=mongoose.model('qrs',qrschema)