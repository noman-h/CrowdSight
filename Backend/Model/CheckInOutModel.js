const mongoose = require("mongoose")

const checkinoutschema=mongoose.Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
        required:true
    },
    palaceid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'palaces',
        required:true
    },
    qrid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'qrs',
        required:true
    },
    checkintime:{
        type:Date,
        required:true
    },
    checkouttime:{
        type:Date,
        default:null
    },
    status:{
        type:String,
        enum:["checkedin","checkedout"],
        default:"checkdin"
    }
},
{
    timestamps:true,
    versionkey:false
})