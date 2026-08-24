import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import ResponsiveSelect from '../Components/ResponsiveSelect';

function AdminRegisterForm() {
  const navigate = useNavigate();

  const role = localStorage.getItem('role');

  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    aadharno: '',
    stateid: '',
    cityid: '',
    areaid: '',
    otp: '',
  });

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Dependent Location States
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [areasList, setAreasList] = useState([]);

  // OTP Verification States
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Loading States
  const [fetchingStates, setFetchingStates] = useState(false);
  const [fetchingCities, setFetchingCities] = useState(false);
  const [fetchingAreas, setFetchingAreas] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState({ type: '', text: '' });

  // Get auth token (adjust key based on your storage layout)
  const token = localStorage.getItem('token');

  // Helper for Authorization Headers
  const getAuthHeaders = (isFormData = false) => ({
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
    },
  });

  // OTP Resend Countdown Timer
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // 1. Fetch States on Mount
  useEffect(() => {
    const fetchStates = async () => {
      setFetchingStates(true);
      try {
        const result = await axios.get(
          `${import.meta.env.VITE_API_URL}location/getallstate?activestatus=true`,
          getAuthHeaders()
        );

        const responseData = result?.data?.result || [];
        setStatesList(responseData);
      } catch (err) {
        console.error('Error fetching states:', err);
      } finally {
        setFetchingStates(false);
      }
    };

    fetchStates();
  }, []);

  // 2. Fetch Cities when State Changes
  useEffect(() => {
    if (!formData.stateid) {
      setCitiesList([]);
      setAreasList([]);
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
      } catch (err) {
        console.error('Error fetching cities:', err);
      } finally {
        setFetchingCities(false);
      }
    };

    fetchCities();
  }, [formData.stateid]);

  // 3. Fetch Areas when City Changes
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
      } catch (err) {
        console.error('Error fetching areas:', err);
      } finally {
        setFetchingAreas(false);
      }
    };

    fetchAreas();
  }, [formData.cityid, formData.stateid]);

  // Fetch Existing Admin Data when ID is Present
  useEffect(() => {
    const fetchadmin = async () => {
      try {
        const result = await axios.get(
          `${import.meta.env.VITE_API_URL}admin/getoneadmin/${id}`,
          getAuthHeaders()
        );
        const adminData = result?.data?.response || result?.data;

        if (adminData) {
          setFormData({
            name: adminData.name || '',
            email: adminData.email || '',
            phone: adminData.phone ? String(adminData.phone) : '',
            address: adminData.address || '',
            aadharno: adminData.aadharno ? String(adminData.aadharno) : '',
            stateid: adminData?.areaid?.cityid?.stateid?._id || adminData.stateid || '',
            cityid: adminData.areaid?.cityid?._id || adminData.cityid || '',
            areaid: adminData.areaid?._id || adminData.areaid || '',
            otp: '',
          });

          if (adminData.profileimage) {
            const imagePath = adminData.profileimage.startsWith('http')
              ? adminData.profileimage
              : `${import.meta.env.VITE_API_URL}${adminData.profileimage}`;
            setImagePreview(imagePath);
          }

          setIsEmailVerified(true);
        }
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setServerMessage({
          type: 'error',
          text: 'Failed to load existing admin details.',
        });
      }
    };

    if (id) {
      fetchadmin();
    }
  }, [id]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'email') {
      setIsOtpSent(false);
      setIsEmailVerified(false);
      setFormData((prev) => ({ ...prev, otp: '' }));
    }

    if (name === 'stateid') {
      setFormData((prev) => ({ ...prev, stateid: value, cityid: '', areaid: '' }));
    } else if (name === 'cityid') {
      setFormData((prev) => ({ ...prev, cityid: value, areaid: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Send Email OTP Handler
  const handleSendOtp = async () => {
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors((prev) => ({ ...prev, email: 'Enter a valid email before requesting OTP.' }));
      return;
    }

    setOtpLoading(true);
    setServerMessage({ type: '', text: '' });

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}admin/adminemailotpsend`,
        { email: formData.email.trim() },
        getAuthHeaders()
      );

      setIsOtpSent(true);
      setOtpTimer(60);
      setServerMessage({ type: 'success', text: response.data?.message || 'OTP sent to your email.' });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to send OTP.';
      setErrors((prev) => ({ ...prev, email: errMsg }));
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify Email OTP Handler
  const handleVerifyOtp = async () => {
    if (!formData.otp.trim() || formData.otp.length < 4) {
      setErrors((prev) => ({ ...prev, otp: 'Please enter a valid OTP.' }));
      return;
    }

    setOtpLoading(true);
    setServerMessage({ type: '', text: '' });

    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}admin/adminotpverify`,
        {
          email: formData.email.trim(),
          otp: Number(formData.otp),
        },
        getAuthHeaders()
      );

      setIsEmailVerified(true);
      setServerMessage({ type: 'success', text: response.data?.message || 'Email verified successfully!' });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Invalid or expired OTP.';
      setErrors((prev) => ({ ...prev, otp: errMsg }));
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle Image Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, profileimage: 'Please select a valid image file.' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, profileimage: 'Image size should be under 5MB.' }));
        return;
      }

      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, profileimage: '' }));
    }
  };

  // Form Validation
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required.';

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    } else if (!isEmailVerified) {
      newErrors.email = 'Please verify your email address before submitting.';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits.';
    }

    if (!formData.address.trim()) newErrors.address = 'Address is required.';

    if (!formData.aadharno) {
      newErrors.aadharno = 'Aadhaar number is required.';
    } else if (!/^[0-9]{12}$/.test(formData.aadharno)) {
      newErrors.aadharno = 'Aadhaar number must be exactly 12 digits.';
    }

    if (!formData.stateid) newErrors.stateid = 'Please select a state.';
    if (!formData.cityid) newErrors.cityid = 'Please select a city.';
    if (!formData.areaid) newErrors.areaid = 'Please select an area.';

    if (!isEditMode && !profileImage) {
      newErrors.profileimage = 'Profile image is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMessage({ type: '', text: '' });

    if (!validate()) return;

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      submitData.append('email', formData.email.trim());
      submitData.append('phone', Number(formData.phone));
      submitData.append('address', formData.address.trim());
      submitData.append('aadharno', Number(formData.aadharno));
      submitData.append('areaid', formData.areaid);

      if (profileImage) {
        submitData.append('profileimage', profileImage);
      }

      let response;
      if (role === 'superadmin' && !isEditMode) {
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}admin/directaddadmin`,
          submitData,
          getAuthHeaders(true)
        );
      } else if (isEditMode) {
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}admin/updateadmin/${id}`,
          submitData,
          getAuthHeaders(true)
        );
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}admin/addadmin`,
          submitData,
          getAuthHeaders(true)
        );
      }

      setServerMessage({
        type: 'success',
        text:
          response.data?.message ||
          (isEditMode
            ? 'Admin details updated successfully!'
            : 'Admin registration submitted successfully! Pending approval.'),
      });

      if (!isEditMode) {
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          aadharno: '',
          stateid: '',
          cityid: '',
          areaid: '',
          otp: '',
        });
        setProfileImage(null);
        setImagePreview(null);
        setIsOtpSent(false);
        setIsEmailVerified(false);
      } else {
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          aadharno: '',
          stateid: '',
          cityid: '',
          areaid: '',
          otp: '',
        });
        setProfileImage(null);
        setImagePreview(null);
        setIsOtpSent(false);
        setIsEmailVerified(false);
        setTimeout(() => {
          navigate(-1);
        }, 2000);
      }
    } catch (err) {
      setServerMessage({
        type: 'error',
        text: err.response?.data?.message || 'Operation failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-slate-50 dark:bg-slate-900 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 text-slate-800 dark:text-slate-100 flex justify-center items-center">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xl p-4 sm:p-10 backdrop-blur-md">

        {/* Header with Back Button */}
        <div className="mb-8 border-b border-slate-200 dark:border-slate-700/60 pb-5">
          <div className="flex items-center gap-3 mb-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
              aria-label="Go Back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-wide">
              {isEditMode ? 'Edit Admin Details' : 'Admin Registration Form'}
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 pl-11">
            {isEditMode
              ? 'Update administrative information and assigned jurisdiction.'
              : 'Submit your administrative application with verified email and area details.'}
          </p>
        </div>

        {/* Server Alert Message */}
        {serverMessage.text && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm font-medium border flex items-start gap-3 ${
              serverMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
            }`}
          >
            <span>{serverMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Profile Image Upload */}
          <div className="flex flex-col items-center sm:flex-row gap-6 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 border-2 border-indigo-500/40 flex items-center justify-center shrink-0">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-1">
                Profile Image {!isEditMode && <span className="text-rose-500">*</span>}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 dark:file:bg-indigo-500/10 dark:file:text-indigo-400 hover:file:bg-indigo-100 cursor-pointer"
              />
              {errors.profileimage && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.profileimage}</p>
              )}
            </div>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full px-4 py-2.5 rounded-xl text-sm border bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                  errors.name ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500'
                }`}
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit phone number"
                maxLength="10"
                className={`w-full px-4 py-2.5 rounded-xl text-sm border bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                  errors.phone ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500'
                }`}
              />
              {errors.phone && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.phone}</p>}
            </div>
          </div>

          {/* Email Verification Component */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isEmailVerified}
                  placeholder="admin@example.com"
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm border bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 disabled:opacity-70 ${
                    errors.email ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500'
                  }`}
                />
                {!isEmailVerified && role !== 'superadmin' && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading || otpTimer > 0}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white font-medium text-xs rounded-xl transition-colors shrink-0 cursor-pointer"
                  >
                    {otpLoading ? 'Sending...' : otpTimer > 0 ? `Resend (${otpTimer}s)` : isOtpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                )}
                {!isEmailVerified && role === 'superadmin' && (
                  <button
                    type="button"
                    onClick={() => setIsEmailVerified(true)}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white font-medium text-xs rounded-xl transition-colors shrink-0 cursor-pointer"
                  >
                    Verify Email
                  </button>
                )}
              </div>
              {errors.email && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email}</p>}
            </div>

            {/* OTP Input Field */}
            {isOtpSent && !isEmailVerified && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Enter OTP <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="Enter verification OTP"
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm border bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                      errors.otp ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpLoading}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-medium text-xs rounded-xl transition-colors shrink-0 cursor-pointer"
                  >
                    {otpLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
                {errors.otp && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.otp}</p>}
              </div>
            )}

            {/* Email Verified Badge */}
            {isEmailVerified && (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Email verified successfully
              </div>
            )}
          </div>

          {/* Aadhaar Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Aadhaar Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="aadharno"
              value={formData.aadharno}
              onChange={handleChange}
              placeholder="12-digit Aadhaar number"
              maxLength="12"
              className={`w-full px-4 py-2.5 rounded-xl text-sm border bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                errors.aadharno ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500'
              }`}
            />
            {errors.aadharno && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.aadharno}</p>}
          </div>

          {/* Location Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* 1. Select State */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                State <span className="text-rose-500">*</span>
              </label>
              <ResponsiveSelect
                value={formData.stateid}
                onChange={(value) => handleChange({ target: { name: 'stateid', value } })}
                disabled={fetchingStates}
                invalid={Boolean(errors.stateid)}
                ariaLabel="Select state"
                className="w-full"
                options={[
                  { value: '', label: fetchingStates ? 'Loading...' : '-- Select State --' },
                  ...statesList.map((state) => ({
                    value: state._id,
                    label: state.statename || state.name || 'Unnamed state',
                  })),
                ]}
              />
              {errors.stateid && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.stateid}</p>}
            </div>

            {/* 2. Select City */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                City <span className="text-rose-500">*</span>
              </label>
              <ResponsiveSelect
                value={formData.cityid}
                onChange={(value) => handleChange({ target: { name: 'cityid', value } })}
                disabled={!formData.stateid || fetchingCities}
                invalid={Boolean(errors.cityid)}
                ariaLabel="Select city"
                className="w-full"
                options={[
                  {
                    value: '',
                    label: !formData.stateid ? 'Select State First' : fetchingCities ? 'Loading...' : '-- Select City --',
                  },
                  ...citiesList.map((city) => ({
                    value: city._id,
                    label: city.cityname || city.name || 'Unnamed city',
                  })),
                ]}
              />
              {errors.cityid && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.cityid}</p>}
            </div>

            {/* 3. Select Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Area <span className="text-rose-500">*</span>
              </label>
              <ResponsiveSelect
                value={formData.areaid}
                onChange={(value) => handleChange({ target: { name: 'areaid', value } })}
                disabled={!formData.cityid || fetchingAreas}
                invalid={Boolean(errors.areaid)}
                ariaLabel="Select area"
                className="w-full"
                options={[
                  {
                    value: '',
                    label: !formData.cityid ? 'Select City First' : fetchingAreas ? 'Loading...' : '-- Select Area --',
                  },
                  ...areasList.map((area) => ({
                    value: area._id,
                    label: area.areaname || area.name || 'Unnamed area',
                  })),
                ]}
              />
              {errors.areaid && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.areaid}</p>}
            </div>

          </div>

          {/* Full Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Residential Address <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="address"
              rows="3"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter street, house no., landmark details"
              className={`w-full px-4 py-2.5 rounded-xl text-sm border bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                errors.address ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500'
              }`}
            />
            {errors.address && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.address}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isEmailVerified}
            className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors duration-200 shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                {isEditMode ? 'Updating Request...' : 'Submitting Request...'}
              </>
            ) : (
              isEditMode ? 'Update Admin Details' : 'Submit Admin Registration'
            )}
          </button>

        </form>
      </div>
    </div>
  );
}

export default AdminRegisterForm;
