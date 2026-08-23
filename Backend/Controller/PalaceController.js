const mongoose=require('mongoose')

const palaces=require('../Model/PalaceModel')
const admins=require('../Model/AdminModel')
const palaceimages=require('../Model/PalaceImagesModel')
const { v4: uuidv4 } = require("uuid");

const { uploadimage } = require('../Utils/FileUpload');
const moment = require("moment");

const HtmlTemplate = require("../Utils/HtmlTemplate");
const sendmail = require("../Utils/Helper");
const PalaceImagesModel = require('../Model/PalaceImagesModel');

const password = uuidv4()

exports.addpalace=async (req,res)=>{
    try{

        const {name,email,address,areaid,description}=req.body

        if(!(name && address && areaid && description)){
            return res.status(400).json({message:"bad request data is missing"})
        }

        const areaadmins = await admins.find({
    areaid,
    approvestatus: "approved",
    activestatus: true
});

if (areaadmins.length === 0) {
    return res.status(404).json({
        message: "there is no active admin found in your area"
    });
}

const randomIndex = Math.floor(Math.random() * areaadmins.length);

const areaadmin = areaadmins[randomIndex];

        const exist=await palaces.findOne({name,email})
        if(exist){
            return res.status(409).json({message:"palace already exist"})
        }

        const palace=await palaces.findOne({email})
        if(!palace){
            return res.status(404).json({message:"palace not found"})
        }
        
      if (req.files) {

    let files = req.files.images;

    // If only one image was uploaded
    if (!Array.isArray(files)) {
        files = [files];
    }

    const uploaddata = await uploadimage(files);

    for (const i of uploaddata) {

        await palaceimages.create({
            image: i.url,
            palaceid: palace._id
        });

    }
}

         const checkid = uuidv4();
            const emailid = await sendmail.mailsend(
              email,
              "status checkid",
              HtmlTemplate.adminCheckIdTemplate(name, checkid),
            );
        
            if (emailid) {
              const data = {name,email,address,areaid,adminid:areaadmin._id,description}
        
              const response = await palaces.findOneAndUpdate({ email }, {
                ...data,
                checkid,
              });
        
              return res.status(201).json({ message: "palace requested successfully" });
            }
        
            return res
              .status(400)
              .json({ message: "admin not added error occured retry" });
          } catch (err) {
            console.log(err);
        
            return res.status(500).json({ message: "internal server error", err });
          }
        };

exports.updatepalace=async (req,res)=>{
    try{

        const {name,email,address,areaid,adminid,description}=req.body
        const {_id}=req.params

        if(!(_id && name && address && areaid && description)){
            return res.status(400).json({message:"bad request data is missing"})
        }


        const palace=await palaces.findById(_id)
        if(!palace){
            return res.status(404).json({message:"palace not found"})
        }
        
      if (req.files) {

    let files = req.files.images;

    // If only one image was uploaded
    if (!Array.isArray(files)) {
        files = [files];
    }

    const uploaddata = await uploadimage(files);

    for (const i of uploaddata) {

        await palaceimages.create({
            image: i.url,
            palaceid: palace._id
        });

    }
}

const response = await palaces.findByIdAndUpdate(
    _id,
    {
        name,
        email,
        address,
        areaid,
        adminid,
        description
    },
    { new: true }
);

return res.status(201).json({ message: "palace updated successfully" });
            
        
    
          } catch (err) {
            console.log(err);
        
            return res.status(500).json({ message: "internal server error", err });
          }
        };

   
 exports.palacereadall = async (req, res) => {
   try {
     const { 
       search, 
       statesort, 
       citysort, 
       areasort, 
       sort, 
       activestatus, 
       approvestatus,
       adminsort,
       page, 
       skip, 
       limit 
     } = req.query;

 
     let matchConditions = {};
 
     // 1. Status Filter
     if (activestatus === "true") {
       matchConditions.activestatus = true;
       matchConditions.approvestatus = "approved";
     } else if (activestatus === "false") {
       matchConditions.activestatus = false;
       matchConditions.approvestatus = "approved";
     } else if (approvestatus === "pending") {
       matchConditions.approvestatus = "pending";
     } else if (approvestatus === "rejected") {
       matchConditions.approvestatus = "rejected";
     }
 
     // 2. Direct Area Filter (if selected directly)
     if (areasort) {
       matchConditions.areaid = new mongoose.Types.ObjectId(areasort);
     }
 
     // 3. Search Filter (Safe Regex)
     if (search && search.trim() !== "") {
       const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
       matchConditions.$or = [
         { name: { $regex: escapedSearch, $options: "i" } },
         { email: { $regex: escapedSearch, $options: "i" } }
       ];
     }
 
     // 4. Sorting Options
     let sortStage = { createdAt: -1 }; // Default: Newest First
     if (sort === "newest") sortStage = { createdAt: -1 };
     else if (sort === "oldest") sortStage = { createdAt: 1 };
 
     // 5. Pagination Calculation
     const limitNum = parseInt(limit) || 10;
     const pageNum = parseInt(page) || 1;
     const skipNum = skip !== undefined ? parseInt(skip) : (pageNum - 1) * limitNum;
 
     // 6. Build the Aggregation Pipeline
     const pipeline = [
       // Match initial admin conditions (status, search, areaid)
       { $match: matchConditions },

       {
  $lookup: {
    from: "palaceimages",
    localField: "_id",
    foreignField: "palaceid",
    as: "images"
  }
},
       {
  $lookup: {
    from: "admins",
    localField: "adminid",
    foreignField: "_id",
    as: "adminid"
  }
},
 { $unwind: { path: "$adminid", preserveNullAndEmptyArrays: true } },
       // Join with Areas collection
       {
         $lookup: {
           from: "areas", // DB collection name for areas
           localField: "areaid",
           foreignField: "_id",
           as: "areaid"
         }
       },
       { $unwind: { path: "$areaid", preserveNullAndEmptyArrays: true } },
 
       // Join with Cities collection
       {
         $lookup: {
           from: "cities", // DB collection name for cities
           localField: "areaid.cityid",
           foreignField: "_id",
           as: "areaid.cityid"
         }
       },
       { $unwind: { path: "$areaid.cityid", preserveNullAndEmptyArrays: true } },
 
       // Join with States collection
       {
         $lookup: {
           from: "states", // DB collection name for states
           localField: "areaid.cityid.stateid",
           foreignField: "_id",
           as: "areaid.cityid.stateid"
         }
       },
       { $unwind: { path: "$areaid.cityid.stateid", preserveNullAndEmptyArrays: true } }
     ];
 
     // Filter by City or State after joins (if selected)
     if (citysort && !areasort) {
       pipeline.push({
         $match: { "areaid.cityid._id": new mongoose.Types.ObjectId(citysort) }
       });
     } else if (statesort && !areasort && !citysort) {
       pipeline.push({
         $match: { "areaid.cityid.stateid._id": new mongoose.Types.ObjectId(statesort) }
       });
     }

     if(adminsort){
        pipeline.push({
         $match: { "adminid._id": new mongoose.Types.ObjectId(adminsort) }
       });
     }
     console.log(pipeline);
     
 
     // 7. Get Total Count (using $facet or a separate aggregate)
     const countPipeline = [...pipeline, { $count: "total" }];
     const countResult = await palaces.aggregate(countPipeline);
     const totalcount = countResult.length > 0 ? countResult[0].total : 0;
 
     // 8. Add Sorting & Pagination to the Main Pipeline
     pipeline.push(
       { $sort: sortStage },
       { $skip: skipNum },
       { $limit: limitNum }
     );
 
     const response = await palaces.aggregate(pipeline);
 
     return res.status(200).json({ response, totalcount });
   } catch (err) {
     console.error("Error in adminreadall:", err);
     return res.status(500).json({ message: "Internal server error" });
   }
 };
        

exports.palacereadone = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        message: "bad request"
      });
    }

    const result = await palaces
      .findOne({ _id: id })
      .populate({
        path: "areaid",
        populate: {
          path: "cityid",
          populate: {
            path: "stateid"
          }
        }
      });

    if (!result) {
      return res.status(404).json({
        message: "data not found"
      });
    }

    const images=await palaceimages.find({palaceid:result._id})

    const response={...result.toObject(),images}

    return res.status(200).json({response});

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "internal server error"
    });
  }
};
 exports.palacereadalladmin = async (req, res) => {
   try {
     const { 
       search, 
       statesort, 
       citysort, 
       areasort, 
       sort, 
       activestatus, 
       approvestatus,
       adminsort,
       page, 
       skip, 
       limit 
     } = req.query;
 
     let matchConditions = {};
 
     // 1. Status Filter
     if (activestatus === "true") {
       matchConditions.activestatus = true;
       matchConditions.approvestatus = "approved";
     } else if (activestatus === "false") {
       matchConditions.activestatus = false;
       matchConditions.approvestatus = "approved";
     } else if (approvestatus === "pending") {
       matchConditions.approvestatus = "pending";
     } else if (approvestatus === "rejected") {
       matchConditions.approvestatus = "rejected";
     }
 
     // 2. Direct Area Filter (if selected directly)
     if (areasort) {
       matchConditions.areaid = new mongoose.Types.ObjectId(areasort);
     }
 
     // 3. Search Filter (Safe Regex)
     if (search && search.trim() !== "") {
       const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
       matchConditions.$or = [
         { name: { $regex: escapedSearch, $options: "i" } },
         { email: { $regex: escapedSearch, $options: "i" } }
       ];
     }
 
     // 4. Sorting Options
     let sortStage = { createdAt: -1 }; // Default: Newest First
     if (sort === "newest") sortStage = { createdAt: -1 };
     else if (sort === "oldest") sortStage = { createdAt: 1 };
 
     // 5. Pagination Calculation
     const limitNum = parseInt(limit) || 10;
     const pageNum = parseInt(page) || 1;
     const skipNum = skip !== undefined ? parseInt(skip) : (pageNum - 1) * limitNum;
 
     // 6. Build the Aggregation Pipeline
     const pipeline = [
       // Match initial admin conditions (status, search, areaid)
       { $match: matchConditions },

       {
  $lookup: {
    from: "palaceimages",
    localField: "_id",
    foreignField: "palaceid",
    as: "images"
  }
},
       {
  $lookup: {
    from: "admins",
    localField: "adminid",
    foreignField: "_id",
    as: "adminid"
  }
},
 { $unwind: { path: "$adminid", preserveNullAndEmptyArrays: true } },
       // Join with Areas collection
       {
         $lookup: {
           from: "areas", // DB collection name for areas
           localField: "areaid",
           foreignField: "_id",
           as: "areaid"
         }
       },
       { $unwind: { path: "$areaid", preserveNullAndEmptyArrays: true } },
 
       // Join with Cities collection
       {
         $lookup: {
           from: "cities", // DB collection name for cities
           localField: "areaid.cityid",
           foreignField: "_id",
           as: "areaid.cityid"
         }
       },
       { $unwind: { path: "$areaid.cityid", preserveNullAndEmptyArrays: true } },
 
       // Join with States collection
       {
         $lookup: {
           from: "states", // DB collection name for states
           localField: "areaid.cityid.stateid",
           foreignField: "_id",
           as: "areaid.cityid.stateid"
         }
       },
       { $unwind: { path: "$areaid.cityid.stateid", preserveNullAndEmptyArrays: true } }
     ];
 
     // Filter by City or State after joins (if selected)
     if (citysort && !areasort) {
       pipeline.push({
         $match: { "areaid.cityid._id": new mongoose.Types.ObjectId(citysort) }
       });
     } else if (statesort && !areasort && !citysort) {
       pipeline.push({
         $match: { "areaid.cityid.stateid._id": new mongoose.Types.ObjectId(statesort) }
       });
     }

     if(adminsort){
        pipeline.push({
         $match: { "adminid._id": new mongoose.Types.ObjectId(adminsort) }
       });
     }
 
     // 7. Get Total Count (using $facet or a separate aggregate)
     const countPipeline = [...pipeline, { $count: "total" }];
     const countResult = await palaces.aggregate(countPipeline);
     const totalcount = countResult.length > 0 ? countResult[0].total : 0;
 
     // 8. Add Sorting & Pagination to the Main Pipeline
     pipeline.push(
       { $sort: sortStage },
       { $skip: skipNum },
       { $limit: limitNum }
     );
 
     const response = await palaces.aggregate(pipeline);
 
     return res.status(200).json({ response, totalcount });
   } catch (err) {
     console.error("Error in adminreadall:", err);
     return res.status(500).json({ message: "Internal server error" });
   }
 };
        

exports.palacereadone = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        message: "bad request"
      });
    }

    const result = await palaces
      .findOne({ _id: id })
      .populate({
        path: "areaid",
        populate: {
          path: "cityid",
          populate: {
            path: "stateid"
          }
        }
      });

    if (!result) {
      return res.status(404).json({
        message: "data not found"
      });
    }

    const images=await palaceimages.find({palaceid:result._id})

    const response={...result.toObject(),images}

    return res.status(200).json({response});

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "internal server error"
    });
  }
};

exports.palacecheckone = async (req, res) => {
  try {
    const checkid = req.params.id;

    if(!checkid){
      return res.status(400).json({message:"bad request"})
    }

    
    const response = await palaces.findOne({ checkid }).populate("areaid");
    if(!response){
      return res.status(404).json({message : "wrong checkid data not found"})
    }
    return res.status(200).json({response });
  } catch (err) {
    
    return res.status(500).json({ message: "internal server error" });
  }
};


exports.palacedelete = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(404).json({ message: "id not found" });
    }

    await palaceimages.deleteMany({
    palaceid: id
});

    const response = await palaces.findByIdAndDelete(id);
    return res.status(200).json({ message: "deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "internal server error" });
  }
};

exports.palacesoftdelete = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(404).json({ message: "id not found" });
    }

    const response = await palaces.findByIdAndUpdate(id, {
      activestatus: false,
    });
    return res.status(200).json({ message: "temporary deleted" });
  } catch (err) {
    return res.status(500).json({ message: "internal server error" });
  }
};

exports.palacerecoverdelete = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(404).json({ message: "id not found" });
    }

    const response = await palaces.findByIdAndUpdate(id, { activestatus: true });
    return res.status(200).json({ message: "restored deleted" });
  } catch (err) {
    return res.status(500).json({ message: "internal server error" });
  }
};


exports.palaceapprove = async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({ message: "id not found" });
    }

    const palacedetail = await palaces.findOne({ _id });
    if (!palacedetail) return res.status(404).json({ message: "admin not found" });

    const saltrounds = 10;
    const salt = bcrypt.genSaltSync(saltrounds);
    const hashpass = bcrypt.hashSync(password, salt);

    const existuser=await users.findOne({email:palacedetail.email})
    
    if(existuser) return res.status(409).json({message:"user already exist"})

    const user = new users({
      name: palacedetail.name,
      email: palacedetail.email,
      password: hashpass,
      role: "admin",
    });

    await user.save();

    const response = await palaces.findByIdAndUpdate(_id, {
      approvestatus: "approved",
      activestatus: true,
    });

    const emailid = await sendmail.mailsend(
      palacedetail.email,
      "admin approved",
      HtmlTemplate.adminApprovedTemplate(
        palacedetail.name,
        palacedetail.email,
        password,
      ),
    );

    return res.status(200).json({ message: "approval updated" });
  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: "internal server error" });
  }
};

exports.palacereject = async (req, res) => {
  try {
    const { _id , reason } = req.body;

    if (!_id) {
      return res.status(404).json({ message: "id not found" });
    }

    const palacedetail = await palaces.findOne({ _id });
    if (!palacedetail) return res.status(404).json({ message: "id not found" });

    const emailid = await sendmail.mailsend(
      palacedetail.email,
      "palace rejected",
      HtmlTemplate.adminRejectedTemplate(palacedetail.name, reason),
    );

    const response = await palaces.findByIdAndUpdate(_id, {
      approvestatus: "rejected",
      activestatus: false,
    });
    return res.status(200).json({ message: "approval updated" });
  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: "internal server error" });
  }
};


exports.emailotpsend = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(404).json({ message: "all keys are required" });
    }


    const otpgen = require("../Utils/OtpGen");
    const otp = otpgen();

    const existing = await palaces.findOne({ email: email });
    if (!existing) {
      const palace = new palaces({
        email: email,
        otp: otp,
        expiretime: moment().add(10, "minutes")
      })
      const saveotp = await palace.save({ validateBeforeSave: false })
    }
    else {
      const saveotp = await palaces.findOneAndUpdate(
        { email: email },
        {
          otp: otp,
          expiretime: moment().add(10, "minutes"),
        },
      );
    }


    const mailid = await sendmail.mailsend(
      email,
      "otp for update form",
      HtmlTemplate.otptemplatetoverifyemail(email, otp),
    );

    if (mailid) {
      return res.status(200).json({ message: "mail send successfully" });
    } else {
      return res.status(400).json({ message: "mail send failed" });
    }
  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: "internal server error" });
  }
};

exports.updateotpsend = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(404).json({ message: "all keys are required" });
    }

    const palace = await palaces.findOne({ email: email });

    if (!palace) {
      return res.status(404).json({ message: "palace not found" });
    }

    const otpgen = require("../Utils/OtpGen");
    const otp = otpgen();
    const saveotp = await palaces.findOneAndUpdate(
      { email: email },
      {
        otp: otp,
        expiretime: moment().add(10, "minutes"),
      },
    );


    

    const mailid = await sendmail.mailsend(
      email,
      "otp for update form",
      HtmlTemplate.adminUpdateOtpTemplate(palace.name, otp),
    );

    if (mailid) {
      return res.status(200).json({ message: "mail send successfully" });
    } else {
      return res.status(400).json({ message: "mail send failed" });
    }
  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: "internal server error" });
  }
};

exports.updateotpverify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!(email && otp)) {
      return res.status(404).json({ message: "all keys are required" });
    }

    const palace = await palaces.findOne({ email: email });

    if (!palace) {
      return res.status(404).json({ message: "palace not found" });
    }

    if (
      Number(otp) === palace.otp &&
      moment().isSameOrBefore(palace.expiretime)
    ) {
      await palaces.findOneAndUpdate(
        { email: email },
        { otp: null, expiretime: null },
      );
      return res.status(200).json({ message: "Code verify" });
    } else if (palace.otp !== Number(otp)) {
      return res.status(401).json({ message: "wrong code" });
    } else {
      await admins.findOneAndUpdate(
        { email: email },
        { otp: null, expiretime: null },
      );
      return res.status(403).json({ message: "Code expire" });
    }
  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: "internal server error" });
  }
};


exports.directpalaceadd = async (req, res) => {
  try {
    const {name,email,address,areaid,adminid,description,approvedby} =
      req.body;


    if (!(name && email && phone && address && areaid)) {
      return res.status(404).json({ message: "all keys are required" });
    }
    const existing = await palaces.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "admin already exist" });
    }

    


    const emailid = await sendmail.mailsend(
      email,
      "owner approved",
      HtmlTemplate.adminApprovedTemplate(
        name,
        email,
        password,
      ),
    );

    if (emailid) {
      const data ={name,email,address,areaid,adminid,description,approvedby}

      const response = await admins.create({
        ...data,
        approvestatus: "approved",
        activestatus: true
      });

       if(req.files){
             const uploaddata = await uploadimage(req.files);
             
             for(const i of uploaddata){
                 await palaceimages.create({image:i.url,palaceid:response._id})
             }
        }

      const saltrounds = 10;
      const salt = bcrypt.genSaltSync(saltrounds);
      const hashpass = bcrypt.hashSync(password, salt);

      const user = new users({
        name: name,
        email: email,
        phone:phone,
        password: hashpass,
        role: "palaceowner",
      });

      await user.save();

      return res.status(201).json({ message: "palace added successfully" });
    }

    return res
      .status(400)
      .json({ message: "palace not added error occured retry" });
  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: "internal server error", err });
  }
};



exports.deleteimage=async (req,res)=>{
    try{
      const id=req.params.id

      if(!id){
        return res.status(400).json({message : "bad request"})
      }

      const image=await palaceimages.findById(id)

      if(!image){
        return res.status(404).json({message : "image not found"})
      }

      const result=await palaceimages.findByIdAndDelete(id)
      return res.status(200).json({message:"image deleted successfully"})

    }
    catch(err){
      return res.status(500).json({message:"internal server erro"})
    }
}  