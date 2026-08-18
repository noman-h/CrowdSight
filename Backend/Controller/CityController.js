const cities=require('../Model/CityModel')
const mongoose=require('mongoose')

exports.addcity=async (req,res)=>{
    try{
        const {cityname,stateid}=req.body

        if(!(cityname && stateid)){
            return res.status(400).json({message : "cityname required"})
        }

        const exist=await cities.findOne({cityname})
        if(exist){
            return res.status(409).json({message:"city already exist"})
        }

        const result=await cities.create({cityname,stateid})
        return res.status(201).json({message : "city added successfully"})
    }
    catch(err){
        console.log(err);
        
       return res.status(500).json({message:"internal server error",err})
    }
}

exports.updatecity=async (req,res)=>{
    try{
        const {_id,cityname,stateid}=req.body

        if(!(_id && cityname && stateid)){
            return res.status(400).json({message : "cityname and id required"})
        }

        const exist=await cities.findById(_id)
        if(!exist){
            return res.status(404).json({message : "city not found"})
        }

      
        const result=await cities.findByIdAndUpdate(_id,{cityname,stateid})
        return res.status(200).json({message:"city updated successfully"})
    }
    catch(err){
      return res.status(500).json({message:"internal server error",err})
    }
}


exports.getallcities = async (req, res) => {
  try {
    const { search, statesort, sort, activestatus, page = 1, limit = 10 } = req.query;

    const pipeline = [];

    // Initial City Filter Stage
    const cityMatch = {};

    if (search) {
      cityMatch.cityname = { $regex: search, $options: 'i' };
    }

    if (statesort) {
      cityMatch.stateid = new mongoose.Types.ObjectId(statesort);
    }

    if (activestatus !== undefined && activestatus !== "") {
      cityMatch.activestatus = (activestatus === "true");
    }

    if (Object.keys(cityMatch).length > 0) {
      pipeline.push({ $match: cityMatch });
    }

    //Join with the states collection
    pipeline.push({
      $lookup: {
        from: 'states', // Ensure this matches your exact MongoDB collection name for states
        localField: 'stateid',
        foreignField: '_id',
        as: 'stateid'
      }
    });

    // Deconstruct stateid array into an object
    pipeline.push({ $unwind: '$stateid' });

    // 4. Filter out cities where state activestatus is false
    pipeline.push({
      $match: { 'stateid.activestatus': true }
    });

    // Build Sort Stage
    const sortQuery = {};
    if (sort === 'az') sortQuery.cityname = 1;
    else if (sort === 'za') sortQuery.cityname = -1;
    else if (sort === 'newest') sortQuery.createdAt = -1;
    else if (sort === 'oldest') sortQuery.createdAt = 1;
    else sortQuery.createdAt = -1;

    // Pagination & Total Count Calculation using $facet
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    pipeline.push({
      $facet: {
        totalCountData: [{ $count: 'count' }],
        result: [
          { $sort: sortQuery },
          { $skip: skip },
          { $limit: limitNum }
        ]
      }
    });

   
    const aggregateResult = await cities.aggregate(pipeline);

    const totalcount = aggregateResult[0]?.totalCountData[0]?.count || 0;
    const result = aggregateResult[0]?.result || [];

    return res.status(200).json({ result, totalcount });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "internal server error" });
  }
};

exports.getonecity=async (req,res)=>{
    try{
        const {id}=req.params

        if(!id){
            return res.status(400).json({message : "bad request id required"})
        }

        const result=await cities.findById(id).populate('stateid')

        if(!result){
            return res.status(404).json({message : "city not found"})
        }

        return res.status(200).json({result})
    }
    catch(err){

        return res.status(500).json({message : "internal server error"})
    }
}

exports.activecity=async (req,res)=>{
    try{
      const {_id}=req.body

      if(!_id){
        return res.status(400).json({message : "bad request id required"})
      }

      const exist=await cities.findById(_id)
      if(!exist){
        return res.status(404).json({message:"city not found"})
      }

      const result=await cities.findByIdAndUpdate(_id,{activestatus:true})
      return res.status(200).json({message:"city active successfully"})
    }
    catch(err){
        return res.status(500).json({message:"internal server error",err})
    }
}

exports.deactivecity=async (req,res)=>{
    try{
      const {_id}=req.body

      if(!_id){
        return res.status(400).json({message : "bad request id required"})
      }

      const exist=await cities.findById(_id)
      if(!exist){
        return res.status(404).json({message:"city not found"})
      }

      const result=await cities.findByIdAndUpdate(_id,{activestatus:false})
      return res.status(200).json({message:"city deactive successfully"})
    }
    catch(err){
        return res.status(500).json({message:"internal server error",err})
    }
}

exports.deletecity=async (req,res)=>{
    try{
      const {_id}=req.params

      if(!_id){
        return res.status(400).json({message : "bad request id required"})
      }

      const exist=await cities.findById(_id)
      if(!exist){
        return res.status(404).json({message:"city not found"})
      }

      const result=await cities.findByIdAndDelete(_id)
      return res.status(200).json({message:"city deleted successfully"})
    }
    catch(err){
        return res.status(500).json({message:"internal server error",err})
    }
}