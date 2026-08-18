const areas=require('../Model/AreaModel')
const mongoose=require('mongoose')

exports.addcity=async (req,res)=>{
    try{
        const {areaname,cityid}=req.body

        console.log(req.body);
        

        if(!(areaname && cityid)){
            return res.status(400).json({message : "areaname required"})
        }

        const exist=await areas.findOne({areaname})
        if(exist){
            return res.status(409).json({message:"area already exist"})
        }

        const result=await areas.create({areaname,cityid})
        return res.status(201).json({message : "area added successfully"})
    }
    catch(err){
       return res.status(500).json({message:"internal server error",err})
    }
}

exports.updatecity=async (req,res)=>{
    try{
        const {_id,areaname,cityid}=req.body

        if(!(_id && areaname && cityid)){
            return res.status(400).json({message : "areaname and id required"})
        }

        const exist=await areas.findById(_id)
        if(!exist){
            return res.status(404).json({message : "area not found"})
        }

      
        const result=await areas.findByIdAndUpdate(_id,{areaname,cityid})
        return res.status(200).json({message:"area updated successfully"})
    }
    catch(err){
      return res.status(500).json({message:"internal server error",err})
    }
}


exports.getallareas = async (req, res) => {
  try {
    const {
      search,
      statesort,
      citysort,
      sort,
      activestatus,
      page = 1,
      limit = 10
    } = req.query;
    
    const query = {};

    // Search Area Name
    if (search) {
      query.areaname = {
        $regex: search,
        $options: "i"
      };
    }

    // Active Status Filter
    if (activestatus !== undefined && activestatus !== "") {
      query.activestatus = activestatus === "true";
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    
    const pipeline = [
      { $match: {...query} },

      // Area -> City Lookup
      {
        $lookup: {
          from: "cities",
          localField: "cityid",
          foreignField: "_id",
          as: "city"
        }
      },
      { $unwind: "$city" },
      { $match: { "city.activestatus": true } },

      // City -> State Lookup
      {
        $lookup: {
          from: "states",
          localField: "city.stateid",
          foreignField: "_id",
          as: "state"
        }
      },
      { $unwind: "$state" },
      { $match: { "state.activestatus": true } }
    ];

    // Safe ObjectId Filter - State
    if (statesort && mongoose.Types.ObjectId.isValid(statesort)) {
      pipeline.push({
        $match: {
          "state._id": new mongoose.Types.ObjectId(statesort)
        }
      });
    }

    // Safe ObjectId Filter - City
    if (citysort && mongoose.Types.ObjectId.isValid(citysort)) {
      pipeline.push({
        $match: {
          "city._id": new mongoose.Types.ObjectId(citysort)
        }
      });
    }

    // Sorting (Handles 'asc', 'desc', and 'newest')
    if (sort) {
      let sortOrder = 1;
      if (sort === "desc" || sort === "newest") {
        sortOrder = -1;
      }
      pipeline.push({
        $sort: { areaname: sortOrder }
      });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    // Facet Stage: Computes total matching records & paginated slices simultaneously
    pipeline.push({
      $facet: {
        metadata: [{ $count: "totalcount" }],
        data: [
          { $skip: skip },
          { $limit: limitNum },
          {
            $project: {
              _id: 1,
              areaname: 1,
              activestatus: 1,
              cityid: "$city",
              stateid: "$state",
              createdAt: 1,
              updatedAt: 1
            }
          }
        ]
      }
    });

    const aggregationResult = await areas.aggregate(pipeline);
    
    const totalcount = aggregationResult[0]?.metadata[0]?.totalcount || 0;
    const result = aggregationResult[0]?.data || [];

    return res.status(200).json({
      success: true,
      totalcount,
      result
    });

  } catch (err) {
    console.error("Error in getallareas:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.getonearea=async (req,res)=>{
    try{
        const {id}=req.params

        if(!id){
            return res.status(400).json({message : "bad request id required"})
        }

        const result=await areas.findById(id).populate({
    path: 'cityid',
    populate: {
      path: 'stateid'
    }
  });

        if(!result){
            return res.status(404).json({message : "area not found"})
        }

        return res.status(200).json({result})
    }
    catch(err){
        console.log(err);
        
        return res.status(500).json({message : "internal server error"})
    }
}

exports.activearea=async (req,res)=>{
    try{
      const {_id}=req.body

      if(!_id){
        return res.status(400).json({message : "bad request id required"})
      }

      const exist=await areas.findById(_id)
      if(!exist){
        return res.status(404).json({message:"area not found"})
      }

      const result=await areas.findByIdAndUpdate(_id,{activestatus:true})
      return res.status(200).json({message:"area active successfully"})
    }
    catch(err){
        return res.status(500).json({message:"internal server error",err})
    }
}

exports.deactivearea=async (req,res)=>{
    try{
      const {_id}=req.body

      if(!_id){
        return res.status(400).json({message : "bad request id required"})
      }

      const exist=await areas.findById(_id)
      if(!exist){
        return res.status(404).json({message:"area not found"})
      }

      const result=await areas.findByIdAndUpdate(_id,{activestatus:false})
      return res.status(200).json({message:"area deactive successfully"})
    }
    catch(err){
        return res.status(500).json({message:"internal server error",err})
    }
}

exports.deletearea=async (req,res)=>{
    try{
      const {_id}=req.params

      if(!_id){
        return res.status(400).json({message : "bad request id required"})
      }

      const exist=await areas.findById(_id)
      if(!exist){
        return res.status(404).json({message:"area not found"})
      }

      const result=await areas.findByIdAndDelete(_id)
      return res.status(200).json({message:"area deleted successfully"})
    }
    catch(err){
        return res.status(500).json({message:"internal server error",err})
    }
}