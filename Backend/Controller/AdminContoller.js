const admins = require("../Model/AdminModel");
const users = require("../Model/UserModel");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

const { uploadimage } = require('../Utils/FileUpload');
const moment = require("moment");

const HtmlTemplate = require("../Utils/HtmlTemplate");
const sendmail = require("../Utils/helper");

exports.adminadd = async (req, res) => {
  try {
    const {name, email, phone, address, areaid ,aadharno } = req.body;

    if (!(name && email && phone && address && areaid)) {
      return res.status(404).json({ message: "all keys are required" });
    }
    const existing = await admins.findOne({ email ,approvestatus:"approved"});
    if (existing) {
      return res.status(409).json({ message: "admin already exist" });
    }

    let urlprofile = null;
    if (req.files) {
      const uploaddata = await uploadimage(req.files);
      urlprofile = uploaddata[0].url;
    }

    const checkid = uuidv4();
    const emailid = await sendmail.mailsend(
      email,
      "status checkid",
      HtmlTemplate.adminCheckIdTemplate(name, checkid),
    );

    if (emailid) {
      const data = req.body;

      const response = await admins.findOneAndUpdate(
        { email }
        ,{
        ...data,
        checkid,
        profileimage: urlprofile
      }
    );

      return res.status(201).json({ message: "ownerdetail requested successfully" });
    }

    return res
      .status(400)
      .json({ message: "admin not added error occured retry" });
  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: "internal server error", err });
  }
};

exports.adminupdate = async (req, res) => {  
  try {
    const {
      name,
      email,
      phone,
      address,
      areaid,
      aadhaarno
    } = req.body;
    const {_id}=req.params

    if (
      !(_id &&
        name &&
        email &&
        phone &&
        address &&
        areaid)
    ) {
      return res.status(404).json({
        message: "all keys are required"
      });
    }

    // Find existing admin
    const admindata = await admins.findById(_id);

    if (!admindata) {
      return res.status(404).json({
        message: "admindata not found"
      });
    }

    // Keep old images by default
    let profileimage = admindata.profileimage;

    // Upload only images that are actually provided
    if (req.files) {

      // Profile image
      if (req.files.profileimage) {
        const uploadProfile = await uploadimage({
          profileImage: req.files.profileImage
        });

        profileImage = uploadProfile[0].url;
      }

     
    }

    const data = {
      name,
      email,
      phone,
      address,
      areaid,
      aadhaarno,
      profileimage
    };

    const response = await admins.findByIdAndUpdate(
      _id,
      data,
      {
        new: true,
        runValidators: true
      }
    );

    return res.status(200).json({
      message: "Admin details updated successfully",
      response
    });

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "internal server error",
      err: err.message
    });
  }
};


exports.adminreadall = async (req, res) => {
  try {
    const { 
      search, 
      statesort, 
      citysort, 
      areasort, 
      sort, 
      activestatus, 
      page, 
      skip, 
      limit 
    } = req.query;

    let matchConditions = {};

    // 1. Status Filter
    if (activestatus === "active") {
      matchConditions.activestatus = true;
      matchConditions.approvestatus = "approved";
    } else if (activestatus === "inactive") {
      matchConditions.activestatus = false;
      matchConditions.approvestatus = "approved";
    } else if (activestatus === "pending") {
      matchConditions.approvestatus = "pending";
    } else if (activestatus === "rejected") {
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

    // 7. Get Total Count (using $facet or a separate aggregate)
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await admins.aggregate(countPipeline);
    const totalcount = countResult.length > 0 ? countResult[0].total : 0;

    // 8. Add Sorting & Pagination to the Main Pipeline
    pipeline.push(
      { $sort: sortStage },
      { $skip: skipNum },
      { $limit: limitNum }
    );

    const response = await admins.aggregate(pipeline);

    return res.status(200).json({ response, totalcount });
  } catch (err) {
    console.error("Error in adminreadall:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.adminreadone = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        message: "bad request"
      });
    }

    const response = await admins
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

    if (!response) {
      return res.status(404).json({
        message: "data not found"
      });
    }

    return res.status(200).json({
      response
    });

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "internal server error"
    });
  }
};

exports.adminbyuserone = async (req, res) => {
    console.log(req.params);
    
  try {
    const email = req.params.email;

    if (!email) {
      return res.status(400).json({
        message: "bad request"
      });
    }

    const response = await admins
      .findOne({email})
      .populate({
        path: "areaid",
        populate: {
          path: "cityid",
          populate: {
            path: "stateid"
          }
        }
      });

    if (!response) {
      return res.status(404).json({
        message: "data not found"
      });
    }

    return res.status(200).json({
      response
    });

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "internal server error"
    });
  }
};

exports.admincheckone = async (req, res) => {
  try {
    const checkid = req.params.id;

    if(!checkid){
      return res.status(400).json({message:"bad request"})
    }

    
    const response = await admins.findOne({ checkid }).populate("areaid");
    if(!response){
      return res.status(404).json({message : "wrong checkid data not found"})
    }
    return res.status(200).json({response });
  } catch (err) {
    
    return res.status(500).json({ message: "internal server error" });
  }
};

exports.admindelete = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(404).json({ message: "id not found" });
    }

    const response = await admins.findByIdAndDelete(id);
    return res.status(200).json({ message: "deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "internal server error" });
  }
};

exports.adminsoftdelete = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(404).json({ message: "id not found" });
    }

    const response = await admins.findByIdAndUpdate(id, {
      activestatus: false,
    });
    return res.status(200).json({ message: "temporary deleted" });
  } catch (err) {
    return res.status(500).json({ message: "internal server error" });
  }
};

exports.adminrecoverdelete = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(404).json({ message: "id not found" });
    }

    const response = await admins.findByIdAndUpdate(id, { activestatus: true });
    return res.status(200).json({ message: "restored deleted" });
  } catch (err) {
    return res.status(500).json({ message: "internal server error" });
  }
};

const password = uuidv4()
exports.adminapprove = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({ message: "id not found" });
    }

    const admindetail = await admins.findOne({ _id });
    if (!admindetail) return res.status(404).json({ message: "admin not found" });

    const saltrounds = 10;
    const salt = bcrypt.genSaltSync(saltrounds);
    const hashpass = bcrypt.hashSync(password, salt);

    const existuser=await users.findOne({email:admindetail.email})
    
    if(existuser) return res.status(409).json({message:"user already exist"})

    await session.withTransaction(async ()=>{
       
       const response = await admins.findByIdAndUpdate(_id, {
      approvestatus: "approved",
      activestatus: true,
    },{session});

    const user = new users({
      name: admindetail.name,
      email: admindetail.email,
      password: hashpass,
      role: "admin",
      adminid:response._id
    });

    await user.save({session});

     })

    const emailid = await sendmail.mailsend(
      admindetail.email,
      "admin approved",
      HtmlTemplate.adminApprovedTemplate(
        admindetail.name,
        admindetail.email,
        password,
      ),
    );

    if(!emailid){
      return res.status(400).json({message:"email not send something wrong"})
    }

    return res.status(200).json({ message: "approval updated" });
  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: "internal server error" });
  }
  finally{
     await session.endSession();
  }
};

exports.adminreject = async (req, res) => {
  try {
    const { _id , reason } = req.body;

    if (!_id) {
      return res.status(404).json({ message: "id not found" });
    }

    const ownerdetail = await admins.findOne({ _id });
    if (!ownerdetail) return res.status(404).json({ message: "id not found" });

    const emailid = await sendmail.mailsend(
      ownerdetail.email,
      "owner rejected",
      HtmlTemplate.adminRejectedTemplate(ownerdetail.name, reason),
    );

    const response = await admins.findByIdAndUpdate(_id, {
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

    const existing = await admins.findOne({ email: email });
    if (!existing) {
      const admin = new admins({
        email: email,
        otp: otp,
        expiretime: moment().add(10, "minutes")
      })
      const saveotp = await admin.save({ validateBeforeSave: false })
    }
    else {
      const saveotp = await admins.findOneAndUpdate(
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

    const ownerdetail = await admins.findOne({ email: email });

    if (!ownerdetail) {
      return res.status(404).json({ message: "ownerdetail not found" });
    }

    const otpgen = require("../Utils/OtpGen");
    const otp = otpgen();
    const saveotp = await admins.findOneAndUpdate(
      { email: email },
      {
        otp: otp,
        expiretime: moment().add(10, "minutes"),
      },
    );


    

    const mailid = await sendmail.mailsend(
      email,
      "otp for update form",
      HtmlTemplate.adminUpdateOtpTemplate(ownerdetail.name, otp),
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

    const ownerdetail = await admins.findOne({ email: email });

    if (!ownerdetail) {
      return res.status(404).json({ message: "ownerdetail not found" });
    }

    if (
      Number(otp) === ownerdetail.otp &&
      moment().isSameOrBefore(ownerdetail.expiretime)
    ) {
      await admins.findOneAndUpdate(
        { email: email },
        { otp: null, expiretime: null },
      );
      return res.status(200).json({ message: "Code verify" });
    } else if (ownerdetail.otp !== Number(otp)) {
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



exports.directadminadd = async (req, res) => {
  const session=await mongoose.startSession();
  try {
    const { name, email, phone, address, areaid } =
      req.body;

    if (!(name && email && phone && address && areaid)) {
      return res.status(404).json({ message: "all keys are required" });
    }
    const existingadmin = await admins.findOne({ email });
    if (existingadmin) {
      return res.status(409).json({ message: "admin already exist" });
    }

     const existuser=await users.findOne({email:email})
            if(existuser){
              return res.status(409).json({message:"email already exist in user"})
            }

    let urlprofile = null;
    if (req.files) {
      const uploaddata = await uploadimage(req.files);
      urlprofile = uploaddata[0].url;
    }

     await session.withTransaction(async ()=>{

      const data = req.body;

      const admin =new admins({
        ...data,
        profileimage: urlprofile,
        approvestatus: "approved",
        activestatus: true
      });

      await admin.save({session})
     
      

      const saltrounds = 10;
      const salt = bcrypt.genSaltSync(saltrounds);
      const hashpass = bcrypt.hashSync(password, salt);



      const user = new users({
        name: name,
        email: email,
        phone:phone,
        password: hashpass,
        role: "admin",
        adminid:admin._id
      });

      await user.save({session});
     })


      const emailid = await sendmail.mailsend(
      email,
      "owner added",
      HtmlTemplate.adminApprovedTemplate(
        name,
        email,
        password,
      ),
    );

    if (!emailid) {
       return res
      .status(400)
      .json({ message: "email not sended something wrong" });
     }

    return res.status(201).json({ message: "admin added successfully" });
   
  } catch (err) {
    return res.status(500).json({ message: "internal server error", err });
  }
  finally{
     await session.endSession();
  }
};

