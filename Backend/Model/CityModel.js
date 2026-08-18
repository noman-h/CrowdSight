const mongoose = require("mongoose")

const Cityschema=mongoose.Schema({
    cityname:{
        type:String,
        required:true,
        trim:true,
        lowercase: true
    },
    stateid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'states',
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

module.exports=mongoose.model('cities',Cityschema)