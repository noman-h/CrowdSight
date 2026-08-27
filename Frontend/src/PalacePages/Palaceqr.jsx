import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Download } from "lucide-react";

function Palaceqr() {
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const palaceid = localStorage.getItem("userid");
  const token = localStorage.getItem("token");

  // =========================================================
  // HEADERS
  // =========================================================

  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // =========================================================
  // API ERROR HANDLER
  // =========================================================

  const handleApiError = (err, fallbackMessage = "Something went wrong") => {
    console.error(err);

    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      fallbackMessage;

    toast.error(message);
  };

  // =========================================================
  // FETCH QR
  // =========================================================

  async function fetchqr() {
    try {
      setLoading(true);

      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}palaceqr/getqr/${palaceid}`,
        headers
      );

      setQr(
        result?.data?.response ||
          result?.data?.result ||
          result?.data
      );
    } catch (err) {
      handleApiError(err, "Unable to fetch QR code");
      setQr(null);
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // ACTIVATE QR
  // =========================================================

  const handleActivate = async () => {
    try {
      setActionLoading("activate");

      const result = await axios.patch(
        `${import.meta.env.VITE_API_URL}palaceqr/activateqr/${qr._id}`,
        {},
        headers
      );

      toast.success(
        result?.data?.message ||
          "QR activated successfully"
      );

      fetchqr();
    } catch (err) {
      handleApiError(err, "Failed to activate QR");
    } finally {
      setActionLoading("");
    }
  };

  // =========================================================
  // DEACTIVATE QR
  // =========================================================

  const handleDeactivate = async () => {
    try {
      setActionLoading("deactivate");

      const result = await axios.patch(
        `${import.meta.env.VITE_API_URL}palaceqr/deactivateqr/${qr._id}`,
        {},
        headers
      );

      toast.success(
        result?.data?.message ||
          "QR deactivated successfully"
      );

      fetchqr();
    } catch (err) {
      handleApiError(err, "Failed to deactivate QR");
    } finally {
      setActionLoading("");
    }
  };

  // =========================================================
  // DELETE QR
  // =========================================================

  const deleteQR = async () => {
    try {
      setActionLoading("delete");

      const result = await axios.delete(
        `${import.meta.env.VITE_API_URL}palaceqr/deleteqr/${qr._id}`,
        headers
      );

      toast.dismiss();

      toast.success(
        result?.data?.message ||
          "QR deleted successfully"
      );

      setQr(null);
    } catch (err) {
      toast.dismiss();
      handleApiError(err, "Failed to delete QR");
    } finally {
      setActionLoading("");
    }
  };

  // =========================================================
  // DELETE CONFIRMATION USING TOAST
  // =========================================================

  const handleDelete = () => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible
              ? "animate-enter"
              : "animate-leave"
          } w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-700 p-5`}
        >
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-xl dark:bg-red-950">
              ⚠️
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Delete QR Code?
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Are you sure you want to permanently delete
                this QR code?
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    toast.dismiss(t.id);
                    deleteQR();
                  }}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Yes, Delete
                </button>

                <button
                  type="button"
                  onClick={() =>
                    toast.dismiss(t.id)
                  }
                  className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        duration: Infinity,
      }
    );
  };

  // =========================================================
  // GENERATE NEW QR
  // =========================================================

  const handleGenerate = async () => {
    try {
      setActionLoading("generate");

      const result = await axios.post(
        `${import.meta.env.VITE_API_URL}palaceqr/generateqr/${palaceid}`,
        {},
        headers
      );

      toast.success(
        result?.data?.message ||
          "New QR generated successfully"
      );

      fetchqr();
    } catch (err) {
      handleApiError(err, "Failed to generate new QR");
    } finally {
      setActionLoading("");
    }
  };

  // =========================================================
  // DOWNLOAD QR
  // =========================================================

  const handleDownload = async () => {
    if (!qr?.qrimage) {
      toast.error("QR image is not available for download");
      return;
    }

    try {
      setActionLoading("download");

      const response = await fetch(qr.qrimage);
      if (!response.ok) {
        throw new Error("Unable to download QR image");
      }

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      const fileIdentifier = String(qr.code || qr._id || "code")
        .replace(/[^a-z0-9-_]/gi, "-")
        .slice(0, 50);
      const downloadLink = document.createElement("a");

      downloadLink.href = imageUrl;
      downloadLink.download = `palace-qr-${fileIdentifier}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      URL.revokeObjectURL(imageUrl);

      toast.success("QR downloaded successfully");
    } catch (err) {
      handleApiError(err, "Failed to download QR");
    } finally {
      setActionLoading("");
    }
  };

  // =========================================================
  // FETCH ON LOAD
  // =========================================================

  useEffect(() => {
    if (palaceid) {
      fetchqr();
    }
  }, []);

  // =========================================================
  // UI
  // =========================================================

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "500",
          },
        }}
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-10">
        <div className="mx-auto max-w-xl">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">

            {/* HEADER */}

            <div className="bg-linear-to-r from-indigo-600 to-violet-600 px-6 py-7 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl">
                ▦
              </div>

              <h1 className="mt-3 text-2xl font-bold text-white">
                Palace QR Code
              </h1>

              <p className="mt-1 text-sm text-indigo-100">
                Manage your palace Check In/Out QR code
              </p>
            </div>

            {/* BODY */}

            <div className="p-6 sm:p-8">

              {loading ? (
                <div className="flex min-h-72 flex-col items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />

                  <p className="mt-4 text-sm text-slate-500">
                    Loading QR code...
                  </p>
                </div>
              ) : qr ? (
                <>
                  {/* QR IMAGE */}

                  <div className="flex justify-center">
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700">

                      {qr.qrimage ? (
                        <img
                          src={qr.qrimage}
                          alt="Palace QR Code"
                          className="h-56 w-56 object-contain sm:h-64 sm:w-64"
                        />
                      ) : (
                        <div className="flex h-56 w-56 items-center justify-center rounded-2xl bg-slate-100 text-center text-sm text-slate-500">
                          QR image not available
                        </div>
                      )}

                    </div>
                  </div>

                  {/* STATUS */}

                  <div className="mt-6 text-center">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                        qr.activestatus
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          qr.activestatus
                            ? "bg-emerald-500"
                            : "bg-red-500"
                        }`}
                      />

                      {qr.activestatus
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  {/* ACTION BUTTONS */}

                  <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">

                    {/* ACTIVATE */}

                    <button
                      type="button"
                      onClick={handleActivate}
                      disabled={
                        actionLoading ||
                        qr.activestatus === true
                      }
                      className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actionLoading === "activate"
                        ? "Activating..."
                        : "Activate"}
                    </button>

                    {/* DEACTIVATE */}

                    <button
                      type="button"
                      onClick={handleDeactivate}
                      disabled={
                        actionLoading ||
                        qr.activestatus === false
                      }
                      className="rounded-xl bg-amber-500 px-4 py-3 font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actionLoading === "deactivate"
                        ? "Deactivating..."
                        : "Deactivate"}
                    </button>

                    {/* GENERATE */}

                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={actionLoading}
                      className="rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actionLoading === "generate"
                        ? "Generating..."
                        : "Generate New QR"}
                    </button>

                    {/* DELETE */}

                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={actionLoading}
                      className="rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actionLoading === "delete"
                        ? "Deleting..."
                        : "Delete QR"}
                    </button>

                    {/* DOWNLOAD */}

                    <button
                      type="button"
                      onClick={handleDownload}
                      disabled={actionLoading || !qr.qrimage}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
                    >
                      <Download size={19} aria-hidden="true" />
                      {actionLoading === "download"
                        ? "Downloading..."
                        : "Download QR"}
                    </button>

                  </div>
                </>
              ) : (
                /* NO QR */

                <div className="flex min-h-72 flex-col items-center justify-center text-center">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl dark:bg-slate-800">
                    ▦
                  </div>

                  <h2 className="mt-4 text-lg font-bold text-slate-800 dark:text-white">
                    No QR Code Found
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Generate a new QR code for your palace.
                  </p>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={actionLoading}
                    className="mt-5 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {actionLoading === "generate"
                      ? "Generating..."
                      : "Generate QR"}
                  </button>

                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Palaceqr;
