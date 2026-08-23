import axios from 'axios';
import React, { useEffect, useState } from 'react';
import UseDebouncing from '../Hooks/UseDebouncing';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

function AdminpalaceManage() {
  const navigate = useNavigate();

  // --- FILTER & SEARCH STATES ---
  const [search, setsearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "oldest"
  const debouncedvalue = UseDebouncing(search, 1000);

  const currentAdminId = localStorage.getItem("userid");

  // Status state: "active" | "inactive" | "pending" | "rejected"
  const [status, setstatus] = useState("active");

  // --- DYNAMIC LOCATION DROPDOWN STATES ---
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [areasList, setAreasList] = useState([]);

  // --- DATA STATES ---
  const [palacedata, setPalacedata] = useState([]);
  const [view, setview] = useState(null);

  // --- REJECT MODAL STATE ---
  const [rejectModal, setRejectModal] = useState({ show: false, id: null, reason: "" });

  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPalaces, setTotalPalaces] = useState(0);

  const token = localStorage.getItem('token');

  // --- AUTH ERROR HANDLER ---
  const handleAuthError = (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("user");
      localStorage.removeItem("userid");
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      localStorage.removeItem("theme");
      navigate('/login');
    }
  };

  // --- FETCH DYNAMIC LOCATION DATA ---
  useEffect(() => {
    async function fetchStates() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}location/getallstate`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStatesList(res?.data?.result || res?.data || []);
      } catch (err) {
        console.error("Error fetching states:", err);
      }
    }
    fetchStates();
  }, [token]);

  useEffect(() => {
    if (!stateFilter) {
      setCitiesList([]);
      setCityFilter("");
      setAreasList([]);
      setAreaFilter("");
      return;
    }
    async function fetchCities() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}location/getallcity?statesort=${stateFilter}&activestatus=true`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCitiesList(res?.data?.result || res?.data || []);
      } catch (err) {
        console.error("Error fetching cities:", err);
      }
    }
    fetchCities();
  }, [stateFilter, token]);

  useEffect(() => {
    if (!cityFilter) {
      setAreasList([]);
      setAreaFilter("");
      return;
    }
    async function fetchAreas() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}location/getallarea?citysort=${cityFilter}&activestatus=true`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAreasList(res?.data?.result || res?.data || []);
      } catch (err) {
        console.error("Error fetching areas:", err);
      }
    }
    fetchAreas();
  }, [cityFilter, token]);

  // --- API OPERATIONS ---
  async function fetchpalaces() {
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}palace/getallpalaces?search=${search}&activestatus=${status === 'active' ? true : status === 'inactive' ? false : ''}&approvestatus=${status}&statesort=${stateFilter}&citysort=${cityFilter}&areasort=${areaFilter}&sort=${sortBy}&adminsort=${currentAdminId}&page=${currentPage}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const responseData = result?.data?.response || [];
      setPalacedata(responseData);

      const count = result?.data?.totalcount ?? responseData.length;
      setTotalPalaces(count);
      setTotalPages(Math.ceil(count / limit) || 1);
    } catch (err) {
      handleAuthError(err);
      console.log(err);
    }
  }

  async function handledeactivate(id) {
    try {
      const result = await axios.patch(
        `${import.meta.env.VITE_API_URL}palace/deactivepalace/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (result.status === 200) {
        toast.success("Palace deactivated successfully");
        fetchpalaces();
      }
    } catch (err) {
      handleAuthError(err);
      console.log(err);
    }
  }

  async function handlerestore(id) {
    try {
      const result = await axios.patch(
        `${import.meta.env.VITE_API_URL}palace/activepalace/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (result.status === 200) {
        toast.success("Palace activated successfully");
        fetchpalaces();
      }
    } catch (err) {
      handleAuthError(err);
      console.log(err);
    }
  }

  // --- APPROVE & REJECT HANDLERS ---
  async function handleApprove(id) {
    try {
      const result = await axios.patch(
        `${import.meta.env.VITE_API_URL}palace/approvepalace`,
        { _id: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (result.status === 200) {
        toast.success("Palace approved successfully");
        fetchpalaces();
      }
    } catch (err) {
      handleAuthError(err);
      console.log(err);
    }
  }

  const openRejectModal = (id) => {
    setRejectModal({ show: true, id, reason: "" });
  };

  const submitReject = async () => {
    if (!rejectModal.reason.trim()) {
      toast.error("Please enter a reason for rejection");
      return;
    }

    try {
      const result = await axios.patch(
        `${import.meta.env.VITE_API_URL}palace/rejectpalace`,
        { _id: rejectModal.id, reason: rejectModal.reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (result.status === 200) {
        toast.success("Palace request rejected successfully");
        setRejectModal({ show: false, id: null, reason: "" });
        fetchpalaces();
      }
    } catch (err) {
      handleAuthError(err);
      console.log(err);
    }
  };

  async function handledelete(id) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This palace record will be permanently deleted!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#0f172a',
      color: '#ffffff'
    });

    if (!result.isConfirmed) return;
    try {
      const result = await axios.delete(
        `${import.meta.env.VITE_API_URL}palace/deletepalace/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (result.status === 200) {
        toast.success("Palace deleted permanently");
        fetchpalaces();
      }
    } catch (err) {
      handleAuthError(err);
      console.log(err);
    }
  }

  async function handleview(id) {
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}palace/getonepalace/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setview(result?.data?.response);
    } catch (err) {
      handleAuthError(err);
      console.log(err);
    }
  }

  // --- DELETE IMAGE HANDLER ---
  async function handleDeleteImage(imageId, palaceId) {
    const result = await Swal.fire({
      title: 'Delete Image?',
      text: "This image will be permanently removed!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#0f172a',
      color: '#ffffff'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}palace/imagedelete/${imageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        toast.success("Image deleted successfully");
        // Refresh single palace view state and table list
        handleview(palaceId);
        fetchpalaces();
      }
    } catch (err) {
      handleAuthError(err);
      toast.error(err?.response?.data?.message || "Failed to delete image");
      console.error(err);
    }
  }

  // --- EFFECT HOOKS ---
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedvalue, stateFilter, cityFilter, areaFilter, status, sortBy]);

  useEffect(() => {
    fetchpalaces();
  }, [debouncedvalue, stateFilter, cityFilter, areaFilter, status, sortBy, currentPage, limit]);

  // --- PAGINATION NUMBERS ---
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) pages.push(1, 2, 3, 4, '...', totalPages);
      else if (currentPage >= totalPages - 2) pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      else pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  const startItem = totalPalaces === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalPalaces);

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-3 sm:p-4 md:p-7 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/70">

      {/* Top Controls Toolbar */}
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">

        {/* Left Filters - Fully Responsive Flex Wrap */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full lg:w-auto">

           {/* Status Segmented Control */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800 w-full sm:w-auto">
            <button
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all duration-200 text-center ${
                status === "active"
                  ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
              onClick={() => setstatus("active")}
            >
              Active
            </button>
            <button
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all duration-200 text-center ${
                status === "inactive"
                  ? "bg-white text-rose-600 shadow-sm dark:bg-slate-700 dark:text-rose-400"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
              onClick={() => setstatus("inactive")}
            >
              Inactive
            </button>
            <button
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all duration-200 text-center ${
                status === "pending"
                  ? "bg-white text-amber-600 shadow-sm dark:bg-slate-700 dark:text-amber-400"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
              onClick={() => setstatus("pending")}
            >
              Pending
            </button>
            <button
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all duration-200 text-center ${
                status === "rejected"
                  ? "bg-white text-red-600 shadow-sm dark:bg-slate-700 dark:text-red-400"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
              onClick={() => setstatus("rejected")}
            >
              Rejected
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search palace name, email..."
              value={search}
              onChange={(e) => setsearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:bg-slate-800 dark:focus:ring-blue-500/20"
            />
          </div>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200 dark:focus:bg-slate-800 dark:focus:ring-blue-500/20"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          {/* Dynamic State Dropdown */}
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200 dark:focus:bg-slate-800 dark:focus:ring-blue-500/20"
          >
            <option value="">All States</option>
            {statesList.map((item) => (
              <option key={item._id} value={item._id}>
                {item.statename || item.name}
              </option>
            ))}
          </select>

          {/* Dynamic City Dropdown */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            disabled={!stateFilter}
            className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200 dark:focus:bg-slate-800 dark:focus:ring-blue-500/20"
          >
            <option value="">All Cities</option>
            {citiesList.map((item) => (
              <option key={item._id} value={item._id}>
                {item.cityname || item.name}
              </option>
            ))}
          </select>

          {/* Dynamic Area Dropdown */}
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            disabled={!cityFilter}
            className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200 dark:focus:bg-slate-800 dark:focus:ring-blue-500/20"
          >
            <option value="">All Areas</option>
            {areasList.map((item) => (
              <option key={item._id} value={item._id}>
                {item.areaname || item.name}
              </option>
            ))}
          </select>
        </div>

        {/* Right Side Action Button */}
        <div className="flex items-center w-full sm:w-auto justify-end">
          <button
            onClick={() => navigate('/palaceaddform')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 cursor-pointer"
          >
            <span className="text-lg leading-none">+</span>
            <span>Add Palace</span>
          </button>
        </div>
      </div>

      {/* Palace Cards Grid / List */}
      <div className="grid gap-3.5">
        {palacedata.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300/80 py-12 text-center dark:border-slate-800">
            <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-800/50">
              <span className="text-xl">🏛️</span>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
              No palace records found
            </p>
          </div>
        ) : (
          palacedata.map((item) => {
            const currentItemStatus = item.approvestatus || (item.activestatus === true ? "active" : "inactive");
            const primaryImage = item.images?.[0]?.image;

            return (
              <div
                key={item._id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 transition-all duration-200 hover:border-blue-500/40 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-blue-500/30 dark:hover:bg-slate-800/80 sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  {/* Information Side */}
                  <div className="flex items-start gap-3.5">
                    {primaryImage ? (
                      <img
                        src={primaryImage}
                        alt={item.name}
                        className="mt-0.5 h-12 w-12 shrink-0 rounded-xl object-cover ring-2 ring-slate-200/80 dark:ring-slate-700"
                      />
                    ) : (
                      <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100/70 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 font-bold">
                        <span className="text-sm uppercase">{(item.name || "P")[0]}</span>
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-semibold capitalize text-slate-900 dark:text-white truncate">
                        {item.name}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 wrap-break-word">
                        Email: <span className="font-medium text-slate-700 dark:text-slate-300">{item.email || "N/A"}</span>
                        <span className="hidden sm:inline">{"  ·  "}</span>
                        <span className="block sm:inline">Address: <span className="font-medium text-slate-700 dark:text-slate-300">{item.address || "N/A"}</span></span>
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            currentItemStatus === "approved" || currentItemStatus === "active"
                              ? "bg-blue-100/80 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                              : currentItemStatus === "pending"
                              ? "bg-amber-100/80 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                              : "bg-rose-100/80 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              currentItemStatus === "approved" || currentItemStatus === "active"
                                ? "bg-blue-500 animate-pulse"
                                : currentItemStatus === "pending"
                                ? "bg-amber-500 animate-pulse"
                                : "bg-rose-500"
                            }`}
                          ></span>
                          <span className="capitalize">{currentItemStatus}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-200/60 pt-3 dark:border-slate-800/80 sm:border-t-0 sm:pt-0 sm:justify-end">
                    <button
                      onClick={() => handleview(item._id)}
                      className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-white cursor-pointer"
                    >
                      View
                    </button>

                    {status === "active" && (
                      <>
                        <button
                          onClick={() => navigate(`/palaceaddform/${item._id}`)}
                          className="rounded-xl bg-slate-200/60 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-700/50 dark:text-slate-300 dark:hover:bg-blue-950/50 dark:hover:text-blue-400 cursor-pointer"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handledeactivate(item._id)}
                          className="rounded-xl bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 cursor-pointer"
                        >
                          Deactivate
                        </button>

                        <button
                          onClick={() => handledelete(item._id)}
                          className="rounded-xl bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400 cursor-pointer"
                        >
                          Delete
                        </button>
                      </>
                    )}

                    {status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(item._id)}
                          className="rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 cursor-pointer"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => openRejectModal(item._id)}
                          className="rounded-xl bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400 cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {status === "inactive" && (
                      <>
                        <button
                          onClick={() => handlerestore(item._id)}
                          className="rounded-xl bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 cursor-pointer"
                        >
                          Restore
                        </button>

                        <button
                          onClick={() => handledelete(item._id)}
                          className="rounded-xl bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400 cursor-pointer"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Container */}
      {totalPalaces > 0 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-5 dark:border-slate-800 sm:flex-row">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Showing <strong className="font-semibold text-slate-800 dark:text-slate-200">{startItem}</strong> to{" "}
              <strong className="font-semibold text-slate-800 dark:text-slate-200">{endItem}</strong> of{" "}
              <strong className="font-semibold text-slate-800 dark:text-slate-200">{totalPalaces}</strong> palaces
            </span>
            <div className="flex items-center gap-1.5">
              <span>Per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value={4}>4</option>
                <option value={6}>6</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
            >
              Prev
            </button>
            <div className="flex items-center gap-1 px-1 overflow-x-auto max-w-50 sm:max-w-none">
              {getPageNumbers().map((pg, idx) =>
                pg === '...' ? (
                  <span key={`d${idx}`} className="px-1 text-xs text-slate-400">...</span>
                ) : (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className={`h-7 w-7 shrink-0 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      currentPage === pg
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : "text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-700/60"
                    }`}
                  >
                    {pg}
                  </button>
                )
              )}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* --- VIEW DETAILS MODAL --- */}
      {view && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] flex flex-col">
            
            {/* Header & Main Info */}
            <div className="flex items-center gap-3 sm:gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800">
              {view.images?.[0]?.image ? (
                <img
                  src={view.images[0].image}
                  alt={view.name}
                  className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl object-cover ring-2 ring-blue-500/20 shrink-0"
                />
              ) : (
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-blue-100 text-xl font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 shrink-0">
                  {(view.name || "P")[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white capitalize truncate">{view.name}</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{view.email}</p>
              </div>
            </div>

            {/* Palace Information List & Image Gallery */}
            <div className="mt-4 space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 overflow-y-auto pr-1 flex-1">
              <p><strong>Address:</strong> {view.address || "N/A"}</p>
              <p><strong>Description:</strong> {view.description || "N/A"}</p>
              <p><strong>Status:</strong> <span className="capitalize">{view.approvestatus || (view.activestatus ? "Active" : "Inactive")}</span></p>
              <p><strong>State:</strong> {view.areaid?.cityid?.stateid?.statename || "N/A"}</p>
              <p><strong>City:</strong> {view.areaid?.cityid?.cityname || "N/A"}</p>
              <p><strong>Area:</strong> {view.areaid?.areaname || "N/A"}</p>

              {/* All Images Section */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                  Palace Images ({view.images?.length || 0})
                </h4>
                {view.images && view.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {view.images.map((imgObj, idx) => (
                      <div
                        key={imgObj._id || idx}
                        className="group relative block aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
                      >
                        <a
                          href={imgObj.image}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block h-full w-full"
                        >
                          <img
                            src={imgObj.image}
                            alt={`Palace view ${idx + 1}`}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                        </a>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(imgObj._id, view._id);
                          }}
                          className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600/90 text-white shadow transition hover:bg-rose-700 cursor-pointer"
                          title="Delete image"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No images uploaded for this palace.</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-slate-200/80 pt-4 dark:border-slate-800">
              <button
                onClick={() => setview(null)}
                className="w-full sm:w-auto rounded-2xl bg-slate-200/80 px-4 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- REJECT REASON MODAL --- */}
      {rejectModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Reject Palace Request</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Please provide a reason for rejecting this palace registration request.
            </p>
            
            <textarea
              rows={4}
              placeholder="Enter rejection reason here..."
              value={rejectModal.reason}
              onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
              className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800"
            />

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-2">
              <button
                onClick={() => setRejectModal({ show: false, id: null, reason: "" })}
                className="w-full sm:w-auto rounded-2xl bg-slate-200/80 px-4 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={submitReject}
                className="w-full sm:w-auto rounded-2xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-600/20 transition hover:bg-rose-700 cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminpalaceManage;