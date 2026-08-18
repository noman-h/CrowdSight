const mongoose=require('mongoose')

const palaceimageschema=mongoose.Schema({
    image:{
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

module.exports=mongoose.model('palaceimages',palaceimageschema)