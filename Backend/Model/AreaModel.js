const mongoose = require("mongoose")

const Areaschema=mongoose.Schema({
    areaname:{
        type:String,
        required:true,
        trim:true,
        lowercase: true
    },
    cityid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'cities',
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

module.exports=mongoose.model('areas',Areaschema)