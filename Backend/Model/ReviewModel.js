const mongoose=require('mongoose')

const reviewschema=mongoose.Schema({
  palaceid:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'palaces'
  },
  userid:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'users'
  },
  checkinid:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'checkins'
  },
  rating:{
    type:Number,
    required:true,
    min:1,
    max:5,
  },
  description:{
    type:String,
    trim:true,
    maxlength:2000
  }
}
,{
    timestamps:true,
    versionkey:false
})

module.exports=mongoose.model('palacereviews',reviewschema)
