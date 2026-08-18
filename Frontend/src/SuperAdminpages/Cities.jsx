import axios from 'axios';
import React, { useEffect, useState } from 'react';
import UseDebouncing from '../Hooks/UseDebouncing';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';

function Cities() {
  const navigate = useNavigate();
  const [search, setsearch] = useState("");
  const [sort, setsort] = useState("");
  const [statesort, setstatesort] = useState("");

  const debouncedvalue = UseDebouncing(search, 1000);

  // Status as boolean: true = active, false = inactive
  const [status, setstatus] = useState(true);

  const [statedata, setstatedata] = useState([]);
  const [citydata, setcitydata] = useState([]);

  const [popup, setpopup] = useState("");
  const [err, seterr] = useState({});
  const [cityd, setcityd] = useState({ cityname: "", stateid: "" });

  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCities, setTotalCities] = useState(0);

  const token = localStorage.getItem('token');

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

  // Fetch active states for dropdown filters & form selections
  async function fetchstates() {
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}location/getallstate?activestatus=true`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const responseData = result?.data?.result || [];
      setstatedata(responseData);
    } catch (err) {
      handleAuthError(err);
      console.log(err);
    }
  }

  // Fetch cities with full pagination, search, sorting, and state filters
  async function fetchcities() {
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}location/getallcity?search=${search}&activestatus=${status}&sort=${sort}&statesort=${statesort}&page=${currentPage}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const responseData = result?.data?.result || [];
      setcitydata(responseData);

      const count = result?.data?.totalcount ?? responseData.length;
      setTotalCities(count);
      setTotalPages(Math.ceil(count / limit) || 1);
    } catch (err) {
      handleAuthError(err);
      console.log(err);
    }
  }

  async function handlecityadd(e) {
    e.preventDefault();

    let obj = {};
    if (!cityd.cityname?.trim()) obj.cityname = "City name is required";
    if (!cityd.stateid) obj.stateid = "State selection is required";

    seterr(obj);

    if (Object.keys(obj).length === 0) {
      if (cityd._id) {
        try {
          const result = await axios.put(
            `${import.meta.env.VITE_API_URL}location/updatecity`,
            cityd,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (result.status === 200) {
            toast.success(cityd._id ? 'City updated successfully!' : 'City add successfully!');
            fetchcities();
            setcityd({ cityname: "", stateid: "" });
            setpopup("");
          }
        } catch (err) {
          handleAuthError(err);
          console.log(err);
        }
      } else {
        try {
          const result = await axios.post(
            `${import.meta.env.VITE_API_URL}location/addcity`,
            cityd,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (result.status === 201) {
            toast.success(cityd._id ? 'City updated successfully!' : 'City added successfully!');
            fetchcities();
            setcityd({ cityname: "", stateid: "" });
            setpopup("");
          }
        } catch (err) {
          handleAuthError(err);
          console.log(err);
        }
      }
    }
  }

  async function handledeactivate(id) {
    try {
      const result = await axios.patch(
        `${import.meta.env.VITE_API_URL}location/deactivecity`,
        { _id:id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (result.status === 200) fetchcities();
    } catch (err) {
      handleAuthError(err);
      console.log(err);
    }
  }

  async function handlerestore(id) {
    try {
      const result = await axios.patch(
        `${import.meta.env.VITE_API_URL}location/activecity`,
        { _id:id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (result.status === 200) fetchcities();
    } catch (err) {
      handleAuthError(err);
      console.log(err);
    }
  }

  async function handledelete(id) {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "This city will be permanently deleted!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626', // Tailwind rose-600
    cancelButtonColor: '#64748b',  // Tailwind slate-500
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    background: '#0f172a', // Optional dark mode background
    color: '#fff'
  });

  if (!result.isConfirmed) return
    try {
      const result = await axios.delete(
        `${import.meta.env.VITE_API_URL}location/deletecity/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (result.status === 200) fetchcities();
    } catch (err) {
      handleAuthError(err);
      console.log(err);
    }
  }

  const [view, setview] = useState(null);

  async function handleview(id) {
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}location/getonecity/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setview(result?.data?.result);
    } catch (err) {
      handleAuthError(err);
      console.log(err);
    }
  }

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedvalue, sort, statesort, status]);

  // Initial load for states list
  useEffect(() => {
    fetchstates();
  }, []);

  // Main data fetch on filter/page updates
  useEffect(() => {
    fetchcities();
  }, [debouncedvalue, sort, statesort, status, currentPage, limit]);

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

  const startItem = totalCities === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalCities);
  

  return (
    <div className="w-full rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/70 sm:p-7">


      {/* Top Controls Toolbar */}
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">

        {/* Left Filters */}
        <div className="flex flex-wrap items-center gap-3">

          {/* Active / Inactive Segmented Control */}
          <div className="inline-flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all duration-200 ${
                status === true
                  ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
              onClick={() => setstatus(true)}
            >
              Active
            </button>
            <button
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all duration-200 ${
                status === false
                  ? "bg-white text-rose-600 shadow-sm dark:bg-slate-700 dark:text-rose-400"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
              onClick={() => setstatus(false)}
            >
              Inactive
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-64 sm:flex-initial">
            <input
              type="text"
              placeholder="Search city..."
              value={search}
              onChange={(e) => setsearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:bg-slate-800 dark:focus:ring-blue-500/20"
            />
          </div>

          {/* Filter by State */}
          <select
            value={statesort}
            onChange={(e) => setstatesort(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200 dark:focus:bg-slate-800 dark:focus:ring-blue-500/20"
          >
            <option value="">All States</option>
            {statedata.map((st) => (
              <option key={st._id} value={st._id}>
                {st.statename}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select
            value={sort}
            onChange={(e) => setsort(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200 dark:focus:bg-slate-800 dark:focus:ring-blue-500/20"
          >
            <option value="">Sort By</option>
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center justify-end">
          <button
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            onClick={() => {
              seterr({});
              setcityd({ cityname: "", stateid: "" });
              setpopup("cityadd");
            }}
          >
            <span className="mr-1.5 text-lg font-light leading-none">+</span> Add City
          </button>
        </div>
      </div>

      {/* City Cards Grid / List */}
      <div className="grid gap-3.5">
        {citydata.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300/80 py-12 text-center dark:border-slate-800">
            <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-800/50">
              <span className="text-xl">🏙️</span>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
              No city records found
            </p>
          </div>
        ) : (
          citydata.map((item) => (
            <div
              key={item._id}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 transition-all duration-200 hover:border-blue-500/40 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-blue-500/30 dark:hover:bg-slate-800/80 sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                {/* Information Side */}
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100/70 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 font-bold">
                    <span className="text-sm uppercase">{item.cityname?.[0] || "C"}</span>
                  </div>
                  <div>
                    <h2 className="text-base font-semibold capitalize text-slate-900 dark:text-white">
                      {item.cityname}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      State: <span className="font-medium text-slate-700 dark:text-slate-300">{item.stateid?.statename || "N/A"}</span>
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          item.activestatus === true
                            ? "bg-blue-100/80 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                            : "bg-rose-100/80 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${item.activestatus ? "bg-blue-500 animate-pulse" : "bg-rose-500"}`}></span>
                        {item.activestatus ? "Active" : "Inactive"}
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

                  {status === true ? (
                    <>
                      <button
                        onClick={() => {
                          seterr({});
                          setcityd({
                            _id: item._id,
                            cityname: item.cityname,
                            stateid: item.stateid?._id || item.stateid || ""
                          });
                          setpopup("cityadd");
                        }}
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
                  ) : (
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
          ))
        )}
      </div>

      {/* Pagination Container */}
      {totalCities > 0 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-5 dark:border-slate-800 sm:flex-row">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Showing <strong className="font-semibold text-slate-800 dark:text-slate-200">{startItem}</strong> to{" "}
              <strong className="font-semibold text-slate-800 dark:text-slate-200">{endItem}</strong> of{" "}
              <strong className="font-semibold text-slate-800 dark:text-slate-200">{totalCities}</strong> cities
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
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
            >
              Prev
            </button>
            <div className="flex items-center gap-1 px-1">
              {getPageNumbers().map((p, idx) =>
                p === '...' ? (
                  <span key={`d${idx}`} className="px-1 text-xs text-slate-400">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`h-7 w-7 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      currentPage === p
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : "text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-700/60"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

     
     
       {/* View City Modal */}
      {view && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">City Details</h2>
              <button
                onClick={() => setview(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/50">
                  <p className="text-xs text-slate-400">City Name</p>
                  <p className="mt-0.5 font-semibold capitalize text-slate-800 dark:text-slate-100">{view.cityname}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/50">
                  <p className="text-xs text-slate-400">State Name</p>
                  <p className="mt-0.5 font-semibold text-slate-800 dark:text-slate-100">
                    {view.stateid?.statename || "N/A"}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/50">
                <p className="text-xs text-slate-400">Status</p>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      view.activestatus === true
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                    }`}
                  >
                    {view.activestatus ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400">Created At</p>
                  <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-300">
                    {view.createdAt ? new Date(view.createdAt).toLocaleString() : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Updated At</p>
                  <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-300">
                    {view.updatedAt ? new Date(view.updatedAt).toLocaleString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end border-t border-slate-100 px-6 py-4 dark:border-slate-800">
              <button
                onClick={() => setview(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

       {/* Add / Edit Form Modal */}
      {popup === "cityadd" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {cityd._id ? "Edit City" : "Add New City"}
              </h3>
              <button
                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                onClick={() => {
                  setpopup("");
                  seterr({});
                  setcityd({ cityname: "", stateid: "" });
                }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handlecityadd} className="flex flex-col gap-3.5">
              
              {/* State Selection Dropdown */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">State</label>
                <select
                  value={cityd.stateid}
                  onChange={(e) => setcityd({ ...cityd, stateid: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:bg-slate-800"
                >
                  <option value="">Select State</option>
                  {statedata.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.statename}
                    </option>
                  ))}
                </select>
                {err.stateid && <p className="mt-1 text-xs text-rose-500">{err.stateid}</p>}
              </div>

              {/* City Name Input */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">City Name</label>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:bg-slate-800"
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={cityd.cityname}
                  onChange={(e) => setcityd({ ...cityd, cityname: e.target.value })}
                />
                {err.cityname && <p className="mt-1 text-xs text-rose-500">{err.cityname}</p>}
              </div>

              <button
                type="submit"
                className="mt-1 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md shadow-blue-600/20 transition hover:shadow-lg hover:shadow-blue-600/30 cursor-pointer"
              >
                {cityd._id ? "Update City" : "Save City"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Cities;