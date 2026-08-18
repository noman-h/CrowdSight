const states=require('../Model/StateModel')

exports.addstate=async (req,res)=>{
    try{
        const {statename}=req.body

        if(!statename){
            return res.status(400).json({message : "statename required"})
        }

        const exist=await states.findOne({statename})
        if(exist){
            return res.status(409).json({message:"state already exist"})
        }

        const result=await states.create({statename})
        return res.status(201).json({message : "state added successfully"})
    }
    catch(err){
       return res.status(500).json({message:"internal server error",err})
    }
}

exports.updatestate=async (req,res)=>{
    try{
        const {_id,statename}=req.body

        if(!(_id && statename)){
            return res.status(400).json({message : "statename and id required"})
        }

        const exist=await states.findById(_id)
        if(!exist){
            return res.status(404).json({message : "state not found"})
        }

        const result=await states.findByIdAndUpdate(_id,{statename})
        return res.status(200).json({message:"state updated successfully"})
    }
    catch(err){
      return res.status(500).json({message:"internal server error",err})
    }
}


exports.getallstate = async (req, res) => {
  try {
    const { search = '', activestatus, sort = '', page = 1, limit = 6 } = req.query;

    
    const query = {};

    // Filter by Active/Inactive status
    if (activestatus !== undefined && activestatus !== '') {
      query.activestatus = activestatus === 'true';
    }

    // Filter by Search Term (Case-insensitive)
    if (search.trim()) {
      query.statename = { $regex: search.trim(), $options: 'i' };
    }

    // Sorting Configuration
    let sortOption = {};
    if (sort === 'az') sortOption = { statename: 1 };
    else if (sort === 'za') sortOption = { statename: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 6;
    const skip = (pageNum - 1) * limitNum;

    

    const totalcount = await states.countDocuments(query);
    const result = await states.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      result,
      totalcount,
    });
  } catch (err) {
    console.log(err);
    
    return res.status(500).json({ message: err.message });
  }
};

exports.getonestate=async (req,res)=>{
    try{
        const {id}=req.params

        if(!id){
            return res.status(400).json({message : "bad request id required"})
        }

        const result=await states.findById(id)

        if(!result){
            return res.status(404).json({message : "state not found"})
        }

        return res.status(200).json({result})
    }
    catch(err){

        return res.status(500).json({message : "internal server error"})
    }
}

exports.activestate=async (req,res)=>{
    try{
      const {id}=req.body

      if(!id){
        return res.status(400).json({message : "bad request id required"})
      }

      const exist=await states.findById(id)
      if(!exist){
        return res.status(404).json({message:"state not found"})
      }

      const result=await states.findByIdAndUpdate(id,{activestatus:true})
      return res.status(200).json({message:"state active successfully"})
    }
    catch(err){
        return res.status(500).json({message:"internal server error",err})
    }
}

exports.deactivestate=async (req,res)=>{
    try{
      const {id}=req.body

      if(!id){
        return res.status(400).json({message : "bad request id required"})
      }

      const exist=await states.findById(id)
      if(!exist){
        return res.status(404).json({message:"state not found"})
      }

      const result=await states.findByIdAndUpdate(id,{activestatus:false})
      return res.status(200).json({message:"state deactive successfully"})
    }
    catch(err){
        return res.status(500).json({message:"internal server error",err})
    }
}

exports.deletestate=async (req,res)=>{
    try{
      const {id}=req.params

      if(!id){
        return res.status(400).json({message : "bad request id required"})
      }

      const exist=await states.findById(id)
      if(!exist){
        return res.status(404).json({message:"state not found"})
      }

      const result=await states.findByIdAndDelete(id)
      return res.status(200).json({message:"state deleted successfully"})
    }
    catch(err){
        return res.status(500).json({message:"internal server error",err})
    }
}