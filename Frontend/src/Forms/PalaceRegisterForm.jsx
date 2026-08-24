import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import ResponsiveSelect from "../Components/ResponsiveSelect";

function PalaceRegisterForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const currentAdminId = localStorage.getItem("userid");
  const adminemail = localStorage.getItem("email");

  // =========================================================
  // FORM
  // =========================================================

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    otp: "",
    stateid: "",
    cityid: "",
    areaid: "",
    adminid: "",
    address: "",
    description: "",
  });

  // =========================================================
  // LOCATION
  // =========================================================

  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [areasList, setAreasList] = useState([]);

  const [fetchingStates, setFetchingStates] = useState(false);
  const [fetchingCities, setFetchingCities] = useState(false);
  const [fetchingAreas, setFetchingAreas] = useState(false);

  // =========================================================
  // ADMINS
  // =========================================================

  const [adminsList, setAdminsList] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);

  // =========================================================
  // IMAGES
  // =========================================================

  const [palaceImages, setPalaceImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // =========================================================
  // OTP
  // =========================================================

  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // =========================================================
  // OTHER
  // =========================================================

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // =========================================================
  // AUTH HEADER
  // =========================================================

  const getAuthHeaders = (isFormData = false) => ({
    headers: {
      Authorization: `Bearer ${token}`,
      ...(isFormData
        ? {
            "Content-Type": "multipart/form-data",
          }
        : {
            "Content-Type": "application/json",
          }),
    },
  });

  // =========================================================
  // OTP TIMER
  // =========================================================

  useEffect(() => {
    if (otpTimer <= 0) return;

    const timer = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [otpTimer]);

  // =========================================================
  // GET STATES
  // =========================================================

  useEffect(() => {
    const fetchStates = async () => {
      setFetchingStates(true);

      try {
        const result = await axios.get(
          `${import.meta.env.VITE_API_URL}location/getallstate?activestatus=true`,
          getAuthHeaders()
        );

        setStatesList(result?.data?.result || []);
      } catch (error) {
        console.error("State error:", error);

        toast.error(
          error?.response?.data?.message ||
            "Unable to load states."
        );
      } finally {
        setFetchingStates(false);
      }
    };

    fetchStates();
  }, []);

  // =========================================================
  // ADMIN:
  // GET LOGGED-IN ADMIN LOCATION
  // =========================================================

  useEffect(() => {
    if (role !== "admin" || !currentAdminId) {
      return;
    }

    const fetchMyAdmin = async () => {
      try {
        const result = await axios.get(
          `${import.meta.env.VITE_API_URL}admin/getuseradmin/${adminemail}`,
          getAuthHeaders()
        );

        const admin =
          result?.data?.response ||
          result?.data?.result ||
          result?.data;

        if (!admin) {
          toast.error("Admin information not found.");
          return;
        }

        const stateId =
          admin?.areaid?.cityid?.stateid?._id ||
          admin?.stateid ||
          "";

        const cityId =
          admin?.areaid?.cityid?._id ||
          admin?.cityid ||
          "";

        const areaId =
          admin?.areaid?._id ||
          admin?.areaid ||
          "";

        setFormData((prev) => ({
          ...prev,
          stateid: stateId,
          cityid: cityId,
          areaid: areaId,
          adminid: currentAdminId,
        }));
      } catch (error) {
        console.error(
          "Error fetching logged-in admin:",
          error
        );

        toast.error(
          error?.response?.data?.message ||
            "Unable to load your assigned location."
        );
      }
    };

    fetchMyAdmin();
  }, [role, currentAdminId, adminemail]);

  // =========================================================
  // GET CITIES
  // =========================================================

  useEffect(() => {
    if (!formData.stateid) {
      setCitiesList([]);
      return;
    }

    const fetchCities = async () => {
      setFetchingCities(true);

      try {
        const result = await axios.get(
          `${import.meta.env.VITE_API_URL}location/getallcity?activestatus=true&statesort=${formData.stateid}`,
          getAuthHeaders()
        );

        setCitiesList(result?.data?.result || []);
      } catch (error) {
        console.error("City error:", error);

        setCitiesList([]);

        toast.error(
          error?.response?.data?.message ||
            "Unable to load cities."
        );
      } finally {
        setFetchingCities(false);
      }
    };

    fetchCities();
  }, [formData.stateid]);

  // =========================================================
  // GET AREAS
  // =========================================================

  useEffect(() => {
    if (!formData.cityid) {
      setAreasList([]);
      return;
    }

    const fetchAreas = async () => {
      setFetchingAreas(true);

      try {
        const result = await axios.get(
          `${import.meta.env.VITE_API_URL}location/getallarea?activestatus=true&citysort=${formData.cityid}&statesort=${formData.stateid}`,
          getAuthHeaders()
        );

        setAreasList(result?.data?.result || []);
      } catch (error) {
        console.error("Area error:", error);

        setAreasList([]);

        toast.error(
          error?.response?.data?.message ||
            "Unable to load areas."
        );
      } finally {
        setFetchingAreas(false);
      }
    };

    fetchAreas();
  }, [formData.cityid, formData.stateid]);

  // =========================================================
  // SUPERADMIN:
  // GET ADMINS ONLY AFTER AREA IS SELECTED
  // =========================================================

  useEffect(() => {
    if (role !== "superadmin") {
      return;
    }

    if (
      !formData.stateid ||
      !formData.cityid ||
      !formData.areaid
    ) {
      setAdminsList([]);
      return;
    }

    const fetchAdmins = async () => {
      setAdminLoading(true);

      try {
        const result = await axios.get(
          `${import.meta.env.VITE_API_URL}admin/getalladmins?activestatus=true&statesort=${formData.stateid}&citysort=${formData.cityid}&areasort=${formData.areaid}`,
          getAuthHeaders()
        );

        const admins =
          result?.data?.response ||
          result?.data?.result ||
          [];

        setAdminsList(admins);

        if (admins.length === 0) {
          toast.error(
            "No active admin found for this area."
          );
        }
      } catch (error) {
        console.error("Admin error:", error);

        setAdminsList([]);

        toast.error(
          error?.response?.data?.message ||
            "Unable to load admins."
        );
      } finally {
        setAdminLoading(false);
      }
    };

    fetchAdmins();
  }, [
    role,
    formData.stateid,
    formData.cityid,
    formData.areaid,
  ]);

  // =========================================================
  // GET EXISTING PALACE FOR UPDATE
  // =========================================================

  useEffect(() => {
    if (!id) return;

    const fetchPalace = async () => {
      try {
        const result = await axios.get(
          `${import.meta.env.VITE_API_URL}palace/getonepalace/${id}`,
          getAuthHeaders()
        );

        const palace =
          result?.data?.response ||
          result?.data?.result ||
          result?.data;

        if (!palace) {
          toast.error("Palace data not found.");
          return;
        }

        const stateId =
          palace?.areaid?.cityid?.stateid?._id ||
          palace?.areaid?.cityid?.stateid ||
          palace?.stateid ||
          "";

        const cityId =
          palace?.areaid?.cityid?._id ||
          palace?.areaid?.cityid ||
          palace?.cityid ||
          "";

        const areaId =
          palace?.areaid?._id ||
          palace?.areaid ||
          "";

        const adminId =
          palace?.adminid?._id ||
          palace?.adminid ||
          "";

        setFormData({
  name: palace?.name || "",
  email: palace?.email || "",
  phone: palace?.phone || "",
  otp: "",
  stateid: stateId,
  cityid: cityId,
  areaid: areaId,
  adminid: adminId,
  address: palace?.address || "",
  description: palace?.description || "",
});

// Existing Cloudinary images
const existingImages =
  palace?.images?.map((item) => item.image).filter(Boolean) || [];

setImagePreviews(existingImages);

       
          setIsEmailVerified(true);
        
      } catch (error) {
        console.error(
          "Fetch palace error:",
          error
        );

        toast.error(
          error?.response?.data?.message ||
            "Unable to load palace."
        );
      }
    };

    fetchPalace();
  }, [id]);

  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "stateid") {
      setFormData((prev) => ({
        ...prev,
        stateid: value,
        cityid: "",
        areaid: "",
        adminid: "",
      }));

      setCitiesList([]);
      setAreasList([]);
      setAdminsList([]);
    } else if (name === "cityid") {
      setFormData((prev) => ({
        ...prev,
        cityid: value,
        areaid: "",
        adminid: "",
      }));

      setAreasList([]);
      setAdminsList([]);
    } else if (name === "areaid") {
      setFormData((prev) => ({
        ...prev,
        areaid: value,
        adminid: "",
      }));

      setAdminsList([]);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // =========================================================
  // EMAIL
  // =========================================================

  const handleEmailChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      email: value,
      otp: "",
    }));

    setIsOtpSent(false);
    setIsEmailVerified(false);
    setOtpTimer(0);

    setErrors((prev) => ({
      ...prev,
      email: "",
      otp: "",
    }));
  };

  // =========================================================
  // ADMIN / SUPERADMIN EMAIL VERIFY
  // =========================================================

  const handlePalaceEmailVerify = () => {
    const email = formData.email.trim();

    if (!email) {
      setErrors((prev) => ({
        ...prev,
        email: "Email is required.",
      }));

      toast.error("Email is required.");
      return;
    }

    if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      setErrors((prev) => ({
        ...prev,
        email: "Enter a valid email.",
      }));

      toast.error("Enter a valid email.");
      return;
    }

    setIsEmailVerified(true);

    toast.success("Email verified successfully.");
  };

  // =========================================================
  // EDIT EMAIL
  // =========================================================

  const handleEditEmail = () => {
    setIsEmailVerified(false);
    setIsOtpSent(false);
    setOtpTimer(0);

    setFormData((prev) => ({
      ...prev,
      otp: "",
    }));
  };

  // =========================================================
  // SEND OTP
  // =========================================================

  const handleSendOtp = async () => {
    const email = formData.email.trim();

    if (!email) {
      setErrors((prev) => ({
        ...prev,
        email: "Email is required.",
      }));

      toast.error("Email is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors((prev) => ({
        ...prev,
        email: "Enter a valid email.",
      }));

      toast.error("Enter a valid email.");
      return;
    }

    setOtpLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}palace/palaceemailotpsend`,
        { email },
        getAuthHeaders()
      );

      setIsOtpSent(true);
      setOtpTimer(60);

      toast.success(
        response?.data?.message ||
          "OTP sent successfully."
      );
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Failed to send OTP.";

      setErrors((prev) => ({
        ...prev,
        email: message,
      }));

      toast.error(message);
    } finally {
      setOtpLoading(false);
    }
  };

  // =========================================================
  // VERIFY OTP
  // =========================================================

  const handleVerifyOtp = async () => {
    if (!formData.otp.trim()) {
      setErrors((prev) => ({
        ...prev,
        otp: "Enter OTP.",
      }));

      toast.error("Enter OTP.");
      return;
    }

    setOtpLoading(true);

    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}palace/palaceotpverify`,
        {
          email: formData.email.trim(),
          otp: Number(formData.otp),
        },
        getAuthHeaders()
      );

      setIsEmailVerified(true);

      setErrors((prev) => ({
        ...prev,
        otp: "",
      }));

      toast.success(
        response?.data?.message ||
          "Email verified successfully."
      );
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Invalid OTP.";

      setErrors((prev) => ({
        ...prev,
        otp: message,
      }));

      toast.error(message);
    } finally {
      setOtpLoading(false);
    }
  };

  // =========================================================
  // IMAGES
  // =========================================================

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    const validFiles = [];
    const previews = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(
          `${file.name} is not a valid image.`
        );
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(
          `${file.name} is larger than 5MB.`
        );
        return;
      }

      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    });

    setPalaceImages(validFiles);
    setImagePreviews(previews);

    setErrors((prev) => ({
      ...prev,
      images:
        validFiles.length === 0
          ? "Please select valid images."
          : "",
    }));

    e.target.value = "";
  };

  // =========================================================
  // VALIDATE
  // =========================================================

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name =
        "Palace name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email =
        "Email is required.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone =
        "Phone number is required.";
    } else if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      newErrors.phone =
        "Enter a valid 10-digit phone number.";
    }

    if (!isEmailVerified) {
      newErrors.email =
        "Please verify the email.";
    }

    if (!formData.stateid) {
      newErrors.stateid =
        "Select state.";
    }

    if (!formData.cityid) {
      newErrors.cityid =
        "Select city.";
    }

    if (!formData.areaid) {
      newErrors.areaid =
        "Select area.";
    }

    if (
      role === "superadmin" &&
      !formData.adminid
    ) {
      newErrors.adminid =
        "Select admin.";
    }

    if (
      role === "admin" &&
      !currentAdminId
    ) {
      newErrors.adminid =
        "Admin information not found.";
    }

    if (!formData.address.trim()) {
      newErrors.address =
        "Address is required.";
    }

    if (!formData.description.trim()) {
      newErrors.description =
        "Description is required.";
    }

    if (
      palaceImages.length === 0 &&
      !id
    ) {
      newErrors.images =
        "Select at least one image.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const resetForm = () => {
  setFormData({
    name: "",
    email: "",
    phone: "",
    otp: "",
    stateid: "",
    cityid: "",
    areaid: "",
    adminid: "",
    address: "",
    description: "",
  });

  setPalaceImages([]);
  setImagePreviews([]);

  setIsOtpSent(false);
  setIsEmailVerified(false);
  setOtpTimer(0);

  setErrors({});

  setCitiesList([]);
  setAreasList([]);
  setAdminsList([]);
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error(
        "Please fix the errors before submitting."
      );
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();

      submitData.append(
        "name",
        formData.name.trim()
      );

      submitData.append(
        "email",
        formData.email.trim()
      );

      submitData.append(
        "phone",
        formData.phone.trim()
      );

      submitData.append(
        "areaid",
        formData.areaid
      );

      submitData.append(
        "address",
        formData.address.trim()
      );

      submitData.append(
        "description",
        formData.description.trim()
      );

      // =====================================================
      // SUPERADMIN
      // =====================================================

      if (role === "superadmin") {
        submitData.append(
          "adminid",
          formData.adminid
        );

        submitData.append(
          "approvedby",
          "superadmin"
        );
      }

      // =====================================================
      // ADMIN
      // =====================================================

      if (role === "admin") {
        submitData.append(
          "adminid",
          currentAdminId
        );

        submitData.append(
          "approvedby",
          "admin"
        );
      }

      // =====================================================
      // IMAGES
      // =====================================================

      palaceImages.forEach((image) => {
        submitData.append(
          "images",
          image
        );
      });

      let response;

      // =====================================================
      // UPDATE
      // =====================================================

      if (id) {
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}palace/updatepalace/${id}`,
          submitData,
          getAuthHeaders(true)
        );
      }

      // =====================================================
      // DIRECT ADD
      // =====================================================

      else if (
        role === "admin" ||
        role === "superadmin"
      ) {
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}palace/directaddpalace`,
          submitData,
          getAuthHeaders(true)
        );
      }

      // =====================================================
      // NORMAL USER
      // =====================================================

      else {
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}palace/addpalace`,
          submitData,
          getAuthHeaders(true)
        );
      }

      // =====================================================
      // SUCCESS TOAST
      // =====================================================

      toast.success(
        response?.data?.message ||
          (id
            ? "Palace updated successfully."
            : "Palace submitted successfully.")
      );

      if(id){
        setTimeout(() => { 
          navigate(-1)
        }, 1000);
      }
      resetForm()

    } catch (error) {
      console.error(
        "Palace submit error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <>
      {/* =====================================================
          TOASTER
      ===================================================== */}

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "500",
          },
        }}
      />

      <div className="min-h-[calc(100dvh-4rem)] bg-linear-to-br from-slate-100 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 py-5 sm:py-12 px-3 sm:px-4">

        <div className="max-w-4xl mx-auto">

          {/* MAIN CARD */}

          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-[0_25px_70px_-20px_rgba(15,23,42,0.25)] border border-slate-200/70 dark:border-slate-700/60 overflow-hidden">

            {/* HEADER */}

            <div className="relative px-4 sm:px-10 py-6 sm:py-10 bg-linear-to-r from-indigo-600 via-indigo-600 to-violet-600">

              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white" />
                <div className="absolute -bottom-32 -left-20 w-72 h-72 rounded-full bg-white" />
              </div>

              <div className="relative">

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="mb-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-medium backdrop-blur-sm transition-all duration-200"
                >
                  <span className="text-lg">
                    ←
                  </span>

                  Back
                </button>

                <div className="flex items-start gap-4">

                  <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/15 border border-white/20 items-center justify-center text-2xl backdrop-blur-sm">
                    🏛️
                  </div>

                  <div>

                    <p className="text-indigo-100 text-sm font-medium mb-1">
                      Palace Management
                    </p>

                    <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                      {id
                        ? "Update Palace"
                        : "Palace Registration"}
                    </h1>

                    <p className="mt-2 text-indigo-100 text-sm sm:text-base max-w-xl">
                      {id
                        ? "Update the palace information below."
                        : "Register a new palace by providing its details, location and images."}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-4 sm:p-10 space-y-6 sm:space-y-8"
            >

              {/* =================================================
                  IMAGES
              ================================================= */}

              <div>

                <div className="mb-3">

                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-100">
                    Palace Images
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Upload clear images of the palace. Maximum 5MB per image.
                  </p>

                </div>

                <label className="group relative flex flex-col items-center justify-center w-full min-h-44 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-200 cursor-pointer">

                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 flex items-center justify-center text-2xl mb-3 group-hover:scale-105 transition-transform">
                    📷
                  </div>

                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Click to upload images
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    PNG, JPG, JPEG up to 5MB
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />

                </label>

                {errors.images && (
                  <p className="flex items-center gap-1 text-red-500 text-xs mt-2">
                    <span>!</span>
                    {errors.images}
                  </p>
                )}

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">

                    {imagePreviews.map(
                      (image, index) => (
                        <div
                          key={index}
                          className="relative group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm"
                        >

                          <img
                            src={image}
                            alt="preview"
                            className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-linear-to-t from-black/60 to-transparent">

                            <p className="text-white text-xs">
                              Image {index + 1}
                            </p>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

              {/* =================================================
                  PALACE INFORMATION
              ================================================= */}

              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

                <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">

                  <h2 className="font-bold text-slate-800 dark:text-white">
                    Palace Information
                  </h2>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Basic information about the palace.
                  </p>

                </div>

                <div className="p-5 space-y-5">

                  {/* PALACE NAME */}

                  <div>

                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                      Palace Name
                      <span className="text-red-500 ml-1">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter palace name"
                      className={`w-full px-4 py-3.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all duration-200 ${
                        errors.name
                          ? "border-red-400 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-950/40"
                          : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/40"
                      }`}
                    />

                    {errors.name && (
                      <p className="text-red-500 text-xs mt-2">
                        {errors.name}
                      </p>
                    )}

                  </div>

                  {/* EMAIL */}

                  <div>

                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                      Owner Email
                      <span className="text-red-500 ml-1">
                        *
                      </span>
                    </label>

                    <div className="flex flex-col sm:flex-row gap-2">

                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleEmailChange}
                        disabled={isEmailVerified}
                        className={`flex-1 px-4 py-3.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all duration-200 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${
                          isEmailVerified
                            ? "border-emerald-300 dark:border-emerald-700"
                            : errors.email
                            ? "border-red-400"
                            : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/40"
                        }`}
                        placeholder="owner@example.com"
                      />

                      {isEmailVerified ? (
                        <button
                          type="button"
                          onClick={handleEditEmail}
                          className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-sm hover:shadow-md transition-all"
                        >
                          Edit
                        </button>
                      ) : role === "admin" ||
                        role === "superadmin" ? (
                        <button
                          type="button"
                          onClick={handlePalaceEmailVerify}
                          className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm hover:shadow-md transition-all"
                        >
                          Verify
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={
                            otpLoading ||
                            otpTimer > 0
                          }
                          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {otpTimer > 0
                            ? `${otpTimer}s`
                            : otpLoading
                            ? "Sending..."
                            : "Send OTP"}
                        </button>
                      )}

                    </div>

                    {isEmailVerified && (
                      <div className="flex items-center gap-2 mt-2 text-emerald-600 dark:text-emerald-400 text-xs font-medium">

                        <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                          ✓
                        </span>

                        Email verified successfully

                      </div>
                    )}

                    {errors.email && (
                      <p className="text-red-500 text-xs mt-2">
                        {errors.email}
                      </p>
                    )}

                  </div>

                  {/* OTP */}

                  {!role &&
                    isOtpSent &&
                    !isEmailVerified && (
                      <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900">

                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                          Enter OTP
                          <span className="text-red-500 ml-1">
                            *
                          </span>
                        </label>

                        <div className="flex flex-col sm:flex-row gap-2">

                          <input
                            type="text"
                            name="otp"
                            value={formData.otp}
                            onChange={handleChange}
                            maxLength={4}
                            placeholder="Enter 4-digit OTP"
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/40"
                          />

                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={otpLoading}
                            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all disabled:opacity-50"
                          >
                            {otpLoading
                              ? "Verifying..."
                              : "Verify OTP"}
                          </button>

                        </div>

                        {errors.otp && (
                          <p className="text-red-500 text-xs mt-2">
                            {errors.otp}
                          </p>
                        )}

                      </div>
                    )}

{/* PHONE NUMBER */}
<div>
  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
    Owner Phone
    <span className="text-red-500 ml-1">*</span>
  </label>

  <input
    type="tel"
    name="phone"
    value={formData.phone}
    onChange={handleChange}
    placeholder="Enter 10-digit phone number"
    maxLength={10}
    inputMode="numeric"
    className={`w-full px-4 py-3.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all duration-200 ${
      errors.phone
        ? "border-red-400 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-950/40"
        : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/40"
    }`}
  />

  {errors.phone && (
    <p className="text-red-500 text-xs mt-2">
      {errors.phone}
    </p>
  )}
</div>
                </div>

              </div>

              {/* =================================================
                  LOCATION
              ================================================= */}

              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-visible">

                <div className="rounded-t-2xl px-5 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
                      📍
                    </div>

                    <div>

                      <h2 className="font-bold text-slate-800 dark:text-white">
                        Palace Location
                      </h2>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Select the palace's registered location.
                      </p>

                    </div>

                  </div>

                </div>

                <div className="p-5">

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                    {/* STATE */}

                    <div>

                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                        State
                        <span className="text-red-500 ml-1">
                          *
                        </span>
                      </label>

                      <ResponsiveSelect
                        value={formData.stateid}
                        onChange={(value) => handleChange({ target: { name: "stateid", value } })}
                        disabled={
                          role === "admin" ||
                          fetchingStates
                        }
                        invalid={Boolean(errors.stateid)}
                        comfortable
                        ariaLabel="Select palace state"
                        className="w-full"
                        options={[
                          {
                            value: "",
                            label: role === "admin" ? "Loading assigned state..." : "Select State",
                          },
                          ...statesList.map((state) => ({
                            value: state._id,
                            label: state.statename || state.name || "Unnamed state",
                          })),
                        ]}
                      />

                      {errors.stateid && (
                        <p className="text-red-500 text-xs mt-2">
                          {errors.stateid}
                        </p>
                      )}

                    </div>

                    {/* CITY */}

                    <div>

                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                        City
                        <span className="text-red-500 ml-1">
                          *
                        </span>
                      </label>

                      <ResponsiveSelect
                        value={formData.cityid}
                        onChange={(value) => handleChange({ target: { name: "cityid", value } })}
                        disabled={
                          role === "admin" ||
                          !formData.stateid ||
                          fetchingCities
                        }
                        invalid={Boolean(errors.cityid)}
                        comfortable
                        ariaLabel="Select palace city"
                        className="w-full"
                        options={[
                          {
                            value: "",
                            label: role === "admin"
                              ? "Loading assigned city..."
                              : !formData.stateid
                                ? "Select State First"
                                : fetchingCities
                                  ? "Loading..."
                                  : "Select City",
                          },
                          ...citiesList.map((city) => ({
                            value: city._id,
                            label: city.cityname || city.name || "Unnamed city",
                          })),
                        ]}
                      />

                      {errors.cityid && (
                        <p className="text-red-500 text-xs mt-2">
                          {errors.cityid}
                        </p>
                      )}

                    </div>

                    {/* AREA */}

                    <div>

                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                        Area
                        <span className="text-red-500 ml-1">
                          *
                        </span>
                      </label>

                      <ResponsiveSelect
                        value={formData.areaid}
                        onChange={(value) => handleChange({ target: { name: "areaid", value } })}
                        disabled={
                          role === "admin" ||
                          !formData.cityid ||
                          fetchingAreas
                        }
                        invalid={Boolean(errors.areaid)}
                        comfortable
                        ariaLabel="Select palace area"
                        className="w-full"
                        options={[
                          {
                            value: "",
                            label: role === "admin"
                              ? "Loading assigned area..."
                              : !formData.cityid
                                ? "Select City First"
                                : fetchingAreas
                                  ? "Loading..."
                                  : "Select Area",
                          },
                          ...areasList.map((area) => ({
                            value: area._id,
                            label: area.areaname || area.name || "Unnamed area",
                          })),
                        ]}
                      />

                      {errors.areaid && (
                        <p className="text-red-500 text-xs mt-2">
                          {errors.areaid}
                        </p>
                      )}

                    </div>

                  </div>

                </div>

              </div>

              {/* =================================================
                  SUPERADMIN ADMIN SECTION
              ================================================= */}

              {role === "superadmin" && (
                <div className="rounded-2xl border border-violet-200 dark:border-violet-900 overflow-hidden">

                  <div className="px-5 py-4 bg-violet-50 dark:bg-violet-950/30 border-b border-violet-200 dark:border-violet-900">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/60 flex items-center justify-center">
                        👤
                      </div>

                      <div>

                        <h2 className="font-bold text-violet-900 dark:text-violet-200">
                          Assign Administrator
                        </h2>

                        <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">
                          Select an admin responsible for this palace.
                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="p-5">

                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                      Select Admin
                      <span className="text-red-500 ml-1">
                        *
                      </span>
                    </label>

                    <select
                      name="adminid"
                      value={formData.adminid}
                      onChange={handleChange}
                      disabled={
                        !formData.areaid ||
                        adminLoading
                      }
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-950/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >

                      <option value="">
                        {!formData.stateid
                          ? "Select State First"
                          : !formData.cityid
                          ? "Select City First"
                          : !formData.areaid
                          ? "Select Area First"
                          : adminLoading
                          ? "Loading Admins..."
                          : adminsList.length === 0
                          ? "No Admin Found"
                          : "Select Admin"}
                      </option>

                      {adminsList.map((admin) => (
                        <option
                          key={admin._id}
                          value={admin._id}
                        >
                          {admin.name ||
                            admin.email}
                        </option>
                      ))}

                    </select>

                    {errors.adminid && (
                      <p className="text-red-500 text-xs mt-2">
                        {errors.adminid}
                      </p>
                    )}

                  </div>

                </div>
              )}

              {/* =================================================
                  ADMIN INFORMATION
              ================================================= */}

              {role === "admin" && (
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">

                  <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-100 dark:bg-blue-900/70 flex items-center justify-center">
                    🔒
                  </div>

                  <div>

                    <p className="text-sm font-bold text-blue-800 dark:text-blue-300">
                      Assigned Location
                    </p>

                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 leading-relaxed">
                      You can only add a palace in your assigned area.
                    </p>

                  </div>

                </div>
              )}

              {/* =================================================
                  ADDRESS + DESCRIPTION
              ================================================= */}

              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

                <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">

                  <h2 className="font-bold text-slate-800 dark:text-white">
                    Additional Details
                  </h2>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Provide address and information about the palace.
                  </p>

                </div>

                <div className="p-5 space-y-5">

                  {/* ADDRESS */}

                  <div>

                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                      Address
                      <span className="text-red-500 ml-1">
                        *
                      </span>
                    </label>

                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Enter complete palace address"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none resize-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/40 transition-all"
                    />

                    {errors.address && (
                      <p className="text-red-500 text-xs mt-2">
                        {errors.address}
                      </p>
                    )}

                  </div>

                  {/* DESCRIPTION */}

                  <div>

                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                      Description
                      <span className="text-red-500 ml-1">
                        *
                      </span>
                    </label>

                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Describe the palace, its history, facilities and important information..."
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none resize-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/40 transition-all"
                    />

                    {errors.description && (
                      <p className="text-red-500 text-xs mt-2">
                        {errors.description}
                      </p>
                    )}

                  </div>

                </div>

              </div>

              {/* =================================================
                  SUBMIT
              ================================================= */}

              <div className="pt-2">

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !isEmailVerified
                  }
                  className="group w-full py-4 rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-950/40 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200"
                >

                  <span className="flex items-center justify-center gap-2">

                    {loading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />

                        Submitting...
                      </>
                    ) : (
                      <>
                        {id
                          ? "Update Palace"
                          : "Submit Palace"}

                        <span className="text-lg group-hover:translate-x-1 transition-transform">
                          →
                        </span>
                      </>
                    )}

                  </span>

                </button>

                {!isEmailVerified && (
                  <p className="text-center text-xs text-slate-400 mt-3">
                    Please verify the owner email before submitting.
                  </p>
                )}

              </div>

            </form>

          </div>

          {/* FOOTER TEXT */}

          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-5">

            All required fields are marked with

            <span className="text-red-500 mx-1">
              *
            </span>

          </p>

        </div>

      </div>
    </>
  );
}

export default PalaceRegisterForm;
