const admins = require("../Model/AdminModel");
const users = require("../Model/UserModel");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

const { uploadimage } = require('../Utils/FileUpload');
const moment = require("moment");

const HtmlTemplate = require("../Utils/HtmlTemplate");
const sendmail = require("../Utils/Helper");
const AdminModel = require("../Model/AdminModel");
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

      const response = await admins.findOneAndUpdate({ email }, {
        ...data,
        checkid,
        profileimage: urlprofile
      });

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
      _id,
      name,
      email,
      phone,
      address,
      cityId,
      aadhaarno
    } = req.body;


    if (
      !(_id &&
        name &&
        email &&
        phone &&
        address &&
        cityId)
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
      cityId,
      aadhaarno,
      profileimage,
      aadhaarFront,
      aadhaarBack
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
    const { search, sort, status, skip, limit } = req.query;
    const searchVal = search || "";

    let matchQuery = {};
    if (status === "active") {
      matchQuery.activeStatus = true;
    } else if (status === "inactive") {
      matchQuery.activeStatus = false;
      matchQuery.approveStatus = "approved";
    } else if (status === "pending") {
      matchQuery.approveStatus = "pending";
    } else if (status === "rejected") {
      matchQuery.approveStatus = "rejected";
    }

    if (searchVal) {
      matchQuery.$or = [
        { name: { $regex: searchVal, $options: "i" } },
        { email: { $regex: searchVal, $options: "i" } },
        { phone: { $regex: searchVal, $options: "i" } }
      ];
    }

    let sorting = null;
    if (sort === "az") sorting = { name: 1 };
    else if (sort === "za") sorting = { name: -1 };
    else if (sort === "newest") sorting = { createdAt: -1 };
    else if (sort === "oldest") sorting = { createdAt: 1 };

    const totalcount = await admins.countDocuments(matchQuery);

    let query = admins.find(matchQuery).populate("cityId");
    if (sorting) query = query.sort(sorting);
    else query = query.sort({ createdAt: -1 });

    if (skip) query = query.skip(parseInt(skip));
    if (limit) query = query.limit(parseInt(limit));

    const response = await query;
    return res.status(200).json({ response, totalcount });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "internal server error" });
  }
};

exports.adminreadone = async (req, res) => {
  try {
    const id = req.params.id;

     if(!id){
      return res.status(400).json({message:"bad request"})
    }

    const response = await admins.findOne({ _id: id }).populate("areaid");

    if(!response){
      return res.status(404).json({message : "wrong checkid data not found"})
    }

    return res.status(200).json({ response });
  } catch (err) {
    return res.status(500).json({ message: "internal server error" });
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
      activeStatus: false,
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

    const response = await admins.findByIdAndUpdate(id, { activeStatus: true });
    return res.status(200).json({ message: "restored deleted" });
  } catch (err) {
    return res.status(500).json({ message: "internal server error" });
  }
};

const password = uuidv4()
exports.adminapprove = async (req, res) => {
  try {
    const { _id, name, email } = req.body;

    if (!_id) {
      return res.status(404).json({ message: "id not found" });
    }

    const ownerdetail = await admins.findOne({ _id });
    if (!ownerdetail) return res.status(404).json({ message: "id not found" });

    const saltrounds = 10;
    const salt = bcrypt.genSaltSync(saltrounds);
    const hashpass = bcrypt.hashSync(password, salt);

    const user = new users({
      name: name,
      email: email,
      password: hashpass,
      role: "admin",
    });

    await user.save();

    const response = await admins.findByIdAndUpdate(_id, {
      approveStatus: "approved",
      activeStatus: true,
    });

    const emailid = await sendmail.mailsend(
      ownerdetail.email,
      "owner approved",
      HtmlTemplate.adminApprovedTemplate(
        ownerdetail.name,
        ownerdetail.email,
        password,
      ),
    );

    return res.status(200).json({ message: "approval updated" });
  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: "internal server error" });
  }
};

exports.adminreject = async (req, res) => {
  try {
    const { _id, name, email, reason } = req.body;

    if (!_id) {
      return res.status(404).json({ message: "id not found" });
    }

    const ownerdetail = await admins.findOne({ _id });
    if (!ownerdetail) return res.status(404).json({ message: "id not found" });

    const emailid = await sendmail.mailsend(
      email,
      "owner rejected",
      HtmlTemplate.adminRejectedTemplate(name, reason),
    );

    const response = await admins.findByIdAndUpdate(_id, {
      approveStatus: "rejected",
      activeStatus: false,
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
      const admin = new AdminModel({
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
    console.log(req.body);

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
  try {
    const { name, email, phone, address, cityId } =
      req.body;


    if (!(name && email && phone && address && cityId)) {
      return res.status(404).json({ message: "all keys are required" });
    }
    const existing = await admins.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "admin already exist" });
    }

    let urlprofile = null;
    let urlaadharfront = null;
    let urlaadharback = null;
    if (req.files) {
      const uploaddata = await uploadimage(req.files);
      urlprofile = uploaddata[0].url;
      urlaadharfront = uploaddata[1].url;
      urlaadharback = uploaddata[2].url;
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
      const data = req.body;

      const response = await admins.create({
        ...data,
        profileImage: urlprofile,
        aadhaarFront: urlaadharfront,
        aadhaarBack: urlaadharback,
        approveStatus: "approved",
        activeStatus: true
      });

      const saltrounds = 10;
      const salt = bcrypt.genSaltSync(saltrounds);
      const hashpass = bcrypt.hashSync(password, salt);

      const user = new users({
        name: name,
        email: email,
        password: hashpass,
        role: "admin",
      });

      await user.save();

      return res.status(201).json({ message: "admin added successfully" });
    }

    return res
      .status(400)
      .json({ message: "admin not added error occured retry" });
  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: "internal server error", err });
  }
};

