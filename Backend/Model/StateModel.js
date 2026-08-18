const mongoose = require("mongoose")

const Stateschema=mongoose.Schema({
    statename:{
        type:String,
        required:true,
        trim:true,
        lowercase: true
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

module.exports=mongoose.model("states",Stateschema)