const reviews=require('../Model/ReviewModel')
const reviewsimages=require('../Model/ReviewImagesModel')

exports.addreview=async (req,res)=>{
    try{
        const {rating,description,palaceid,userid,checkinid}=req.body

       if(!(rating && palaceid && userid && checkinid)){
        return res.status(400).json({message:"bad request rating not needed"})
       }

       const existreview=await reviews.findOne({checkinid})
       if(existreview){
         return res.status(409).json({message:"review already exist"})
       }

       const review=await reviews.create({
          rating,
          description,
          palaceid,
          userid,
          checkinid
       })
   
        if(req.files){
                        const uploaddata = await uploadimage(req.files);
                        
                        for(const i of uploaddata){
                            await reviewsimages.create({image:i.url,reviewid:review._id})
                        }
                   }
                 
        return res.status(201).json({message : "review added successfully"})
    }
    catch(err){
        return res.status(500).json({message : "internal server erro",err})
    }
}

exports.updatereview=async (req,res)=>{
    try{
        const {rating,description,palaceid,userid,checkinid}=req.body
        const _id=req.params.id

       if(!(rating && palaceid && userid && checkinid)){
        return res.status(400).json({message:"bad request rating not needed"})
       }

       const existreview=await reviews.findById(_id)
       if(!existreview){
         return res.status(404).json({message:"review not found"})
       }

       const review=await reviews.findByIdAndUpdate(_id,
        {
          rating,
          description,
          palaceid,
          userid,
          checkinid
       })
   
        if(req.files){
                        const uploaddata = await uploadimage(req.files);
                        
                        for(const i of uploaddata){
                            await reviewsimages.create({image:i.url,reviewid:review._id})
                        }
                   }
                 
         return res.status(200).json({message : "review updated successfully"})
    }
    catch(err){
        return res.status(500).json({message : "internal server erro",err})
    }
}

exports.deletereview=async (req,res)=>{
    try{
        const _id=req.params.id

       const existreview=await reviews.findById(_id)
       if(!existreview){
         return res.status(404).json({message:"review not found"})
       }

         await reviews.findByIdAndDelete(_id)
                 
         return res.status(200).json({message : "review deleted successfully"})
    }
    catch(err){
        return res.status(500).json({message : "internal server erro",err})
    }
}