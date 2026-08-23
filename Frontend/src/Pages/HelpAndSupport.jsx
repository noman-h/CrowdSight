import axios from 'axios';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function HelpAndSupport() {
  const [activeTab, setActiveTab] = useState("admin");
  const [searchId, setSearchId] = useState("");
  const [statusResult, setStatusResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // OTP Verification States
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false); // Added: Loading state for sending OTP
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  
  const navigate = useNavigate();

  // Reset status and modal when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchId("");
    setStatusResult(null);
    setIsModalOpen(false);
    setIsOtpModalOpen(false);
  };

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setStatusResult(null);

    const baseUrl = import.meta.env.VITE_API_URL;

    // 1. Determine dynamic endpoint based on activeTab
    const endpoint = activeTab === "admin"
      ? `${baseUrl}admin/getcheckone/${searchId.trim()}`
      : `${baseUrl}palace/getcheckone/${searchId.trim()}`;

    const typeLabel = activeTab === "admin" ? "Admin Request" : "Palace Request";

    try {
      const res = await axios.get(endpoint);

      // 2. Extract nested 'response' object from JSON
      const data = res.data?.response;

      if (!data) {
        throw new Error("No record found for this ID.");
      }

      // Capitalize status string (e.g., "pending" -> "Pending")
      const formattedStatus = data.approvestatus
        ? data.approvestatus.charAt(0).toUpperCase() + data.approvestatus.slice(1)
        : "Unknown";

      // 3. Map returned fields from API response
      setStatusResult({
        id: data.checkid || searchId,
        dbId: data._id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        type: typeLabel,
        activeTab: activeTab,
        status: formattedStatus,
        details: `Request for ${data.name || 'user'} is currently ${data.approvestatus}.`,
        area: data.areaid?.areaname,
        address: data.address,
        profileImage: data.profileimage,
        updatedAt: data.updatedAt 
          ? new Date(data.updatedAt).toLocaleDateString() 
          : new Date().toLocaleDateString(),
      });

    } catch (error) {
      console.error(`Failed to fetch status from ${endpoint}:`, error);

      const errorMessage = error.response?.data?.message || error.message || "Could not retrieve status. Please try again.";

      setStatusResult({
        id: searchId,
        type: typeLabel,
        activeTab: activeTab,
        status: "Error",
        details: errorMessage,
        updatedAt: new Date().toLocaleDateString(),
      });
    } finally {
      setLoading(false);
    }
  };

  // Opens the view details modal
  const handleOpenDetailsModal = () => {
    if (!statusResult?.dbId) return;
    setIsModalOpen(true);
  };

  // Step 1: Initiate OTP Verification Workflow
  const handleInitiateOtp = async () => {
    if (!statusResult?.dbId) return;

    setIsSendingOtp(true);
    setOtpInput("");
    setOtpError("");

    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const result = await axios.patch(`${baseUrl}admin/adminotpsend`, { 
        dbId: statusResult.dbId, 
        email: statusResult.email 
      });

      if (result.status === 200) {
        toast.success('OTP sent successfully');
        // Only close details modal and open OTP modal AFTER dispatch succeeds
        setIsModalOpen(false);
        setIsOtpModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to send OTP:", err);
      toast.error(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2: Verify OTP and navigate to edit/update form
  const handleVerifyOtpAndNavigate = async (e) => {
    e.preventDefault();
    if (!otpInput.trim()) {
      setOtpError("Please enter the OTP.");
      return;
    }

    setIsVerifying(true);
    setOtpError("");

    try {
      const baseUrl = import.meta.env.VITE_API_URL;

      const result = await axios.patch(`${baseUrl}admin/adminotpverify`, { 
        email: statusResult.email, 
        otp: otpInput 
      });

      if (result.status === 200) {
        toast.success('OTP verified successfully');
        const targetPath = statusResult.activeTab === "admin"
          ? `/adminaddform/${statusResult.dbId}`
          : `/palaceaddform/${statusResult.dbId}`;
        
        setIsOtpModalOpen(false);
        navigate(targetPath);
      }
      
    } catch (error) {
      console.error("OTP Verification failed:", error);
      setOtpError(error.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-none backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-wide">Help & Support</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Submit support requests or track approval status
            </p>
          </div>
          <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-4 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 text-sm font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.172l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Support Center
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-white dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-none backdrop-blur-md">
          <div className="flex border-b border-slate-200 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => handleTabChange("admin")}
              className={`pb-3 px-6 text-sm font-semibold transition-all relative flex items-center gap-2 ${
                activeTab === "admin"
                  ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-500"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Admin Request
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("palace")}
              className={`pb-3 px-6 text-sm font-semibold transition-all relative flex items-center gap-2 ${
                activeTab === "palace"
                  ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-500"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Palace Request
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Action Area */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-none backdrop-blur-md p-6 sm:p-8 space-y-8">
            
            {activeTab === "admin" ? (
              <div className="w-full space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Submit Admin Request</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Fill out the administrative ticket form to request system permissions, feature updates, or support.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/adminaddform')}
                  className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm"
                >
                  Go to Admin Request Form
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="w-full space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Submit Palace Request</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Proceed to the Palace integration form to register new properties or integrations.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/palaceaddform')}
                  className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm"
                >
                  Go to Palace Request Form
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            )}

            {/* Universal Status Checker Section */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700/50 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Check {activeTab === "admin" ? "Admin" : "Palace"} Request Status
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Enter your {activeTab === "admin" ? "Admin" : "Palace"} Request ID below to check whether your submission has been approved or rejected.
                </p>
              </div>

              <form onSubmit={handleCheckStatus} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder={`Enter ${activeTab === "admin" ? "Admin" : "Palace"} ID (e.g., ${activeTab === "admin" ? "ADM-101" : "PLC-202"})`}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={loading || !searchId.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm"
                >
                  {loading ? (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Check Status
                    </>
                  )}
                </button>
              </form>

              {/* Status Result Display Card */}
              {statusResult && (
                <div className="mt-4 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {statusResult.type} ID: {statusResult.id}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        statusResult.status === "Approved"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                          : statusResult.status === "Rejected"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
                          : statusResult.status === "Error"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                      }`}
                    >
                      {statusResult.status}
                    </span>
                  </div>

                  {/* Profile & User summary */}
                  {statusResult.name && (
                    <div className="flex items-center gap-3 py-1">
                      {statusResult.profileImage ? (
                        <img 
                          src={statusResult.profileImage} 
                          alt={statusResult.name} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-600"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-sm">
                          {statusResult.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{statusResult.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{statusResult.email}</p>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {statusResult.details}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      Last updated: {statusResult.updatedAt}
                    </p>

                    {/* View Details Button opens Modal */}
                    {statusResult.status !== "Error" && statusResult.dbId && (
                      <button
                        type="button"
                        onClick={handleOpenDetailsModal}
                        className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Side Info & FAQ Panel */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm dark:shadow-none backdrop-blur-md space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Help & Response Desk
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Submissions are logged into the central management dashboard. Urgent admin tickets are prioritized within 2 to 4 working hours.
              </p>

              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white block">Email Support</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">support@yourdomain.com</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white block">Working Hours</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Mon - Sat: 9:00 AM - 7:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* View Details Popup Modal */}
      {isModalOpen && statusResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-lg w-full p-6 space-y-6 relative overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  Request Details
                </span>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  {statusResult.type}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSendingOtp}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4">
              {/* User Profile Summary */}
              {statusResult.name && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  {statusResult.profileImage ? (
                    <img 
                      src={statusResult.profileImage} 
                      alt={statusResult.name} 
                      className="w-12 h-12 rounded-full object-cover border border-slate-300 dark:border-slate-600"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-base">
                      {statusResult.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-base font-semibold text-slate-900 dark:text-white capitalize">{statusResult.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{statusResult.email}</p>
                  </div>
                </div>
              )}

              {/* Detail Items Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg space-y-1">
                  <span className="text-slate-400 dark:text-slate-500 block font-medium">Request ID</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{statusResult.id}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg space-y-1">
                  <span className="text-slate-400 dark:text-slate-500 block font-medium">Approval Status</span>
                  <span
                    className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                      statusResult.status === "Approved"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                        : statusResult.status === "Rejected"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                    }`}
                  >
                    {statusResult.status}
                  </span>
                </div>
                {statusResult.phone && (
                  <div className="bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg space-y-1">
                    <span className="text-slate-400 dark:text-slate-500 block font-medium">Phone</span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{statusResult.phone}</span>
                  </div>
                )}
                {statusResult.area && (
                  <div className="bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg space-y-1">
                    <span className="text-slate-400 dark:text-slate-500 block font-medium">Area</span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{statusResult.area}</span>
                  </div>
                )}
              </div>

              {statusResult.address && (
                <div className="bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg space-y-1 text-xs">
                  <span className="text-slate-400 dark:text-slate-500 block font-medium">Address</span>
                  <span className="text-slate-800 dark:text-slate-200">{statusResult.address}</span>
                </div>
              )}

              <div className="bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg space-y-1 text-xs">
                <span className="text-slate-400 dark:text-slate-500 block font-medium">Description / Details</span>
                <span className="text-slate-700 dark:text-slate-300">{statusResult.details}</span>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSendingOtp}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
              >
                Close
              </button>
              
              {/* Update Button triggers OTP Dispatch and Loading State */}
              <button
                type="button"
                onClick={handleInitiateOtp}
                disabled={isSendingOtp}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm min-w-30"
              >
                {isSendingOtp ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Update Request</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* OTP Verification Popup Modal */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-md w-full p-6 space-y-6 relative overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Security Verification
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOtpModalOpen(false)}
                disabled={isVerifying}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* OTP Form Body */}
            <form onSubmit={handleVerifyOtpAndNavigate} className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Please enter the OTP sent to your registered email (<span className="font-semibold text-slate-800 dark:text-slate-200">{statusResult?.email}</span>) to edit this request.
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Enter OTP
                </label>
                <input
                  type="text"
                  maxLength="6"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="e.g. 123456"
                  disabled={isVerifying}
                  className="w-full px-4 py-2.5 rounded-xl text-center text-lg tracking-widest font-semibold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
                {otpError && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{otpError}</p>
                )}
              </div>

              {/* Resend Option inside Verification Modal */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleInitiateOtp}
                  disabled={isSendingOtp || isVerifying}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium disabled:opacity-50 flex items-center gap-1"
                >
                  {isSendingOtp && <span className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent" />}
                  Resend OTP
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsOtpModalOpen(false)}
                  disabled={isVerifying}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || !otpInput.trim()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm min-w-30"
                >
                  {isVerifying ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    "Verify & Continue"
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default HelpAndSupport;