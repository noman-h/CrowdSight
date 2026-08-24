const mongoose=require('mongoose')

const reviewimageschema=mongoose.Schema({
    image:{
        type:String,
        required:true
    },
     reviewid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'palacereviews',
        required:true
    }
},
{
    timestamps:true,
    versionkey:false
})

module.exports=mongoose.model('reviewimages',reviewimageschema)