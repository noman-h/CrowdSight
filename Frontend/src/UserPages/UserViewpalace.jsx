import axios from 'axios'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  Phone,
  QrCode,
  ShieldCheck,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import QrScannerModal from '../Components/QrScannerModal'

const API_BASE_URL = import.meta.env.VITE_API_URL

function UserViewPalace() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [palace, setPalace] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    axios
      .get(`${API_BASE_URL}palace/getonepalace/${id}`, {
        signal: controller.signal,
      })
      .then((response) => {
        const palaceData = response?.data?.response || response?.data?.result || null

        if (!palaceData) {
          setError('Palace not found.')
          return
        }

        if (palaceData.activestatus !== true || palaceData.approvestatus !== 'approved') {
          setError('This palace is currently unavailable.')
          return
        }

        setPalace(palaceData)
        setSelectedImageIndex(0)
        setError('')
      })
      .catch((requestError) => {
        if (requestError.code !== 'ERR_CANCELED') {
          setError(
            requestError?.response?.status === 404
              ? 'Palace not found.'
              : requestError?.response?.data?.message || 'Unable to load palace details. Please try again.',
          )
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [id])

  if (loading) {
    return (
      <main className="min-h-[calc(100dvh-4rem)] bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-10 w-36 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="h-72 bg-slate-200 dark:bg-slate-800 sm:h-96" />
            <div className="space-y-4 p-6">
              <div className="h-8 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-24 rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !palace) {
    return (
      <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <Building2 size={32} aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Palace unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {error || 'The requested palace could not be found.'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft size={17} aria-hidden="true" />
            Back to palaces
          </button>
        </div>
      </main>
    )
  }

  const images = palace.images || []
  const selectedImage = images[selectedImageIndex]?.image
  const stateName = palace.areaid?.cityid?.stateid?.statename
  const cityName = palace.areaid?.cityid?.cityname
  const areaName = palace.areaid?.areaname
  const location = [areaName, cityName, stateName].filter(Boolean).join(', ')

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-slate-50 px-4 py-6 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900 hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Back to all palaces
        </button>

        <article className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid lg:grid-cols-[1.35fr_1fr]">
            <section className="border-b border-slate-200 p-4 dark:border-slate-800 sm:p-6 lg:border-b-0 lg:border-r">
              <div className="flex h-72 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 sm:h-96 lg:h-120">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={`${palace.name} view ${selectedImageIndex + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-linear-to-br from-blue-100 via-sky-50 to-indigo-100 text-blue-600 dark:from-blue-950 dark:via-slate-900 dark:to-indigo-950 dark:text-blue-400">
                    <Building2 size={64} strokeWidth={1.4} aria-hidden="true" />
                    <span className="mt-3 text-sm font-medium">No palace images available</span>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5" aria-label="Palace image gallery">
                  {images.map((image, index) => (
                    <button
                      type="button"
                      key={image._id || index}
                      onClick={() => setSelectedImageIndex(index)}
                      aria-label={`View palace image ${index + 1}`}
                      aria-pressed={selectedImageIndex === index}
                      className={`aspect-video overflow-hidden rounded-xl border-2 transition ${
                        selectedImageIndex === index
                          ? 'border-blue-600 ring-2 ring-blue-500/20'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={image.image}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
              >
                <QrCode size={19} aria-hidden="true" />
                Scan QR 
              </button>
            </section>

            <section className="flex flex-col p-5 sm:p-7 lg:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Palace details
                  </p>
                  <h1 className="mt-2 text-2xl font-bold capitalize text-slate-900 dark:text-white sm:text-3xl">
                    {palace.name}
                  </h1>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <ShieldCheck size={15} aria-hidden="true" />
                  Approved
                </span>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/60">
                  <MapPin size={19} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Location</p>
                    <p className="mt-1 text-sm capitalize text-slate-700 dark:text-slate-200">
                      {location || palace.address || 'Location not available'}
                    </p>
                  </div>
                </div>

                {palace.address && (
                  <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/60">
                    <Building2 size={19} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Address</p>
                      <p className="mt-1 text-sm capitalize text-slate-700 dark:text-slate-200">{palace.address}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-7">
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">About this palace</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {palace.description || 'No description is available for this palace.'}
                </p>
              </div>

              <div className="mt-7">
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
                  Contact information
                </h2>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-200 p-3.5 dark:border-slate-700">
                    <Phone size={18} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Phone number</p>
                      <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                        {palace.phone || 'Not available'}
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-200 p-3.5 dark:border-slate-700">
                    <Mail size={18} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email address</p>
                      <p className="mt-1 break-all text-sm font-medium text-slate-700 dark:text-slate-200">
                        {palace.email || 'Not available'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </article>
      </div>

      {scannerOpen && <QrScannerModal onClose={() => setScannerOpen(false)} />}
    </main>
  )
}

export default UserViewPalace
