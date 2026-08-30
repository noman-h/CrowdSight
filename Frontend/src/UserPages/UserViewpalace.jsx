import axios from 'axios'
import { useEffect, useState } from 'react'
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Building2,
  Clock3,
  LogIn,
  Mail,
  MapPin,
  Phone,
  QrCode,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingDown,
  Users,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import QrScannerModal from '../Components/QrScannerModal'

const API_BASE_URL = import.meta.env.VITE_API_URL

function MiniRatingStars({ rating }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => <Star key={index} size={13} className={index < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-300 dark:fill-slate-800 dark:text-slate-600'} aria-hidden="true" />)}
    </span>
  )
}

function ReviewPreview({ data, loading, error }) {
  if (loading) return <div className="mt-4 h-32 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" aria-label="Loading review summary" />

  if (error || !data) {
    return <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"><Star size={17} className="mr-2 inline text-slate-400" />Reviews are currently unavailable.</div>
  }

  return (
    <section className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900">
      <div className="grid md:grid-cols-[14rem_minmax(0,1fr)]">
        <div className="border-b border-slate-100 bg-linear-to-br from-amber-50 to-orange-50 p-4 dark:border-slate-800 dark:from-amber-950/30 dark:to-orange-950/20 md:border-b-0 md:border-r">
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">Visitor reviews</p>
          <div className="mt-2 flex items-end gap-2"><p className="text-3xl font-black text-slate-900 dark:text-white">{Number(data.averageRating || 0).toFixed(1)}</p><span className="pb-1 text-xs font-semibold text-slate-400">/ 5</span></div>
          <div className="mt-1"><MiniRatingStars rating={data.averageRating || 0} /></div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">From {data.totalReviews || 0} guest reviews</p>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          {data.result?.length > 0 ? data.result.slice(0, 2).map((review) => (
            <article key={review._id} className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700/70 dark:bg-slate-800/60">
              <div className="flex items-center justify-between gap-2"><p className="truncate text-xs font-bold capitalize text-slate-800 dark:text-slate-100">{review.userid?.name || 'Guest'}</p><MiniRatingStars rating={review.rating} /></div>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{review.description || 'No written feedback.'}</p>
            </article>
          )) : <div className="col-span-full flex min-h-20 items-center justify-center text-sm text-slate-500 dark:text-slate-400">No reviews have been shared yet.</div>}
        </div>
      </div>
    </section>
  )
}

function CrowdPreview({ data, loading, error }) {
  if (loading) {
    return <div className="mt-4 h-28 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" aria-label="Loading crowd snapshot" />
  }

  if (error || !data) {
    return (
      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <Activity size={18} className="shrink-0 text-slate-400" /> Crowd information is currently updating.
      </div>
    )
  }

  const weeklyBest = data.bestTimes?.weekly || data.bestTime
  const recommendations = [
    ['Best this week', weeklyBest?.label],
    ['Best this month', data.bestTimes?.monthly?.label],
    ['Best this year', data.bestTimes?.yearly?.label],
  ]

  return (
    <section className="mt-4 overflow-hidden rounded-3xl border border-blue-200 bg-linear-to-r from-blue-700 via-indigo-700 to-violet-800 text-white shadow-lg shadow-blue-950/15 dark:border-blue-900">
      <div className="grid sm:grid-cols-[minmax(12rem,1.25fr)_minmax(0,2fr)]">
        <div className="flex items-center gap-4 border-b border-white/15 p-4 sm:border-b-0 sm:border-r sm:p-5">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15"><Users size={23} /><span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-pulse rounded-full border-2 border-blue-700 bg-emerald-400" /></div>
          <div><p className="text-[11px] font-bold uppercase tracking-wider text-blue-200">Live crowd now</p><div className="mt-1 flex items-baseline gap-2"><p className="text-3xl font-black">{data.currentCrowd}</p><span className="text-xs font-semibold text-blue-100">people inside</span></div></div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-white/15">
          {recommendations.map(([label, value]) => (
            <div key={label} className="min-w-0 p-3 sm:p-4"><p className="truncate text-[9px] font-bold uppercase tracking-wide text-blue-200 sm:text-[10px]">{label}</p><p className="mt-1 truncate text-sm font-black sm:text-base">{value || 'Analysing'}</p></div>
          ))}
        </div>
      </div>
      <a href="#crowd-information" className="flex items-center justify-center gap-1.5 border-t border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-blue-100 transition hover:bg-white/10 hover:text-white"><BarChart3 size={14} /> View detailed crowd trends</a>
    </section>
  )
}

function CrowdInformation({ data, loading, error }) {
  if (loading) {
    return (
      <section className="mt-6 animate-pulse rounded-3xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800" />)}</div>
        <div className="mt-5 h-64 rounded-2xl bg-slate-100 dark:bg-slate-800" />
      </section>
    )
  }

  if (error || !data) {
    return (
      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <Activity size={30} className="mx-auto text-slate-300 dark:text-slate-700" />
        <h2 className="mt-3 font-bold text-slate-800 dark:text-slate-100">Crowd information unavailable</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{error || 'Unable to analyse recent crowd activity.'}</p>
      </section>
    )
  }

  const dailyMaximum = Math.max(1, ...data.daily.map((item) => item.checkins))
  const hourlyMaximum = Math.max(1, ...data.hourly.map((item) => item.averageCrowd))
  const crowdStatus = data.currentCrowd === 0 ? 'Quiet right now' : data.currentCrowd < 10 ? 'Low crowd' : data.currentCrowd < 25 ? 'Moderate crowd' : 'Busy right now'
  const weeklyBest = data.bestTimes?.weekly || data.bestTime
  const monthlyBest = data.bestTimes?.monthly
  const yearlyBest = data.bestTimes?.yearly

  return (
    <section id="crowd-information" className="mt-6 scroll-mt-20 space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Live & historical activity</p><h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white sm:text-2xl">Crowd information</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Privacy-safe trends calculated from check-in and checkout activity.</p></div>
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />Live now</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"><Users size={18} /></div><p className="mt-3 text-xs font-bold uppercase tracking-wide text-emerald-700/70 dark:text-emerald-300/70">Current crowd</p><p className="mt-1 text-3xl font-black text-emerald-900 dark:text-emerald-100">{data.currentCrowd}</p><p className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">{crowdStatus}</p></article>
        <article className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"><BarChart3 size={18} /></div><p className="mt-3 text-xs font-bold uppercase tracking-wide text-blue-700/70 dark:text-blue-300/70">Last 7 days</p><p className="mt-1 text-3xl font-black text-blue-900 dark:text-blue-100">{data.totalCheckins}</p><p className="mt-1 text-xs font-semibold text-blue-700 dark:text-blue-300">Total check-ins</p></article>
        <article className="rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/30"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300"><Activity size={18} /></div><p className="mt-3 text-xs font-bold uppercase tracking-wide text-violet-700/70 dark:text-violet-300/70">Daily average</p><p className="mt-1 text-3xl font-black text-violet-900 dark:text-violet-100">{data.averageDailyCheckins}</p><p className="mt-1 text-xs font-semibold text-violet-700 dark:text-violet-300">Check-ins per day</p></article>
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"><Sparkles size={18} /></div><p className="mt-3 text-xs font-bold uppercase tracking-wide text-amber-700/70 dark:text-amber-300/70">Best time this week</p><p className="mt-1 text-2xl font-black text-amber-900 dark:text-amber-100">{weeklyBest?.label || 'Not enough data'}</p><p className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-300">Lowest recent crowd</p></article>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 sm:p-5">
          <div><h3 className="font-bold text-slate-900 dark:text-white">Last 7 days</h3><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Daily visitor check-ins</p></div>
          <div className="mt-5 flex h-52 items-end gap-2" role="img" aria-label="Check-ins over the last seven days">
            {data.daily.map((item) => {
              const height = item.checkins ? Math.max(8, (item.checkins / dailyMaximum) * 100) : 2
              return <div key={item.key} className="group flex h-full min-w-0 flex-1 flex-col justify-end"><div className="relative flex flex-1 items-end"><span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-bold text-white group-hover:block">{item.checkins} check-ins</span><div className="w-full rounded-t-md bg-linear-to-t from-blue-700 to-cyan-400 transition-all group-hover:from-blue-600 group-hover:to-cyan-300" style={{ height: `${height}%` }} /></div><span className="mt-2 text-center text-[10px] font-bold text-slate-400">{item.label}</span></div>
            })}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 sm:p-5">
          <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-slate-900 dark:text-white">Best-time analysis</h3><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Based on average hourly occupancy</p></div><TrendingDown size={20} className="text-emerald-600 dark:text-emerald-400" /></div>
          {weeklyBest ? <div className="mt-5 rounded-2xl bg-linear-to-br from-emerald-700 to-teal-800 p-5 text-white"><p className="text-xs font-bold uppercase tracking-wide text-emerald-200">Weekly recommendation</p><p className="mt-2 text-3xl font-black">{weeklyBest.label}</p><p className="mt-2 text-sm text-emerald-100">Around {weeklyBest.averageCrowd} people on average during this hour.</p></div> : <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">More check-ins are needed before a reliable recommendation can be made.</div>}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30"><p className="text-[11px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">Monthly best time</p><p className="mt-2 text-xl font-black text-blue-900 dark:text-blue-100">{monthlyBest?.label || 'Not enough data'}</p><p className="mt-1 text-xs text-blue-700/70 dark:text-blue-300/70">Based on {data.analysisTotals?.monthly || 0} check-ins in 30 days</p></div>
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/30"><p className="text-[11px] font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400">Yearly best time</p><p className="mt-2 text-xl font-black text-violet-900 dark:text-violet-100">{yearlyBest?.label || 'Not enough data'}</p><p className="mt-1 text-xs text-violet-700/70 dark:text-violet-300/70">Based on {data.analysisTotals?.yearly || 0} check-ins in 12 months</p></div>
          </div>
          {data.peakTime && <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-700"><span className="text-slate-500 dark:text-slate-400">Usually busiest</span><span className="font-bold text-slate-900 dark:text-white">{data.peakTime.label}</span></div>}
        </article>
      </div>

      <article className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 sm:p-5">
        <div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><Clock3 size={18} /></div><div><h3 className="font-bold text-slate-900 dark:text-white">Hourly crowd pattern</h3><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Average people inside by hour over the last seven days</p></div></div>
        <div className="mt-5 overflow-x-auto pb-2"><div className="flex h-52 min-w-200 items-end gap-2" role="img" aria-label="Average hourly crowd over the last seven days">
          {data.hourly.map((item) => {
            const height = item.averageCrowd ? Math.max(8, (item.averageCrowd / hourlyMaximum) * 100) : 2
            const isBest = weeklyBest?.hour === item.hour
            return <div key={item.hour} className="group flex h-full min-w-0 flex-1 flex-col justify-end"><div className="relative flex flex-1 items-end"><span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-bold text-white group-hover:block">{item.label}: {item.averageCrowd} average</span><div className={`w-full rounded-t-sm bg-linear-to-t transition-all ${isBest ? 'from-emerald-700 to-lime-400 ring-2 ring-emerald-300 ring-offset-1 dark:ring-offset-slate-900' : 'from-violet-700 to-fuchsia-400 group-hover:from-violet-600 group-hover:to-fuchsia-300'}`} style={{ height: `${height}%` }} /></div><span className={`mt-2 truncate text-center text-[9px] font-medium ${isBest ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>{item.label}</span></div>
          })}
        </div></div>
      </article>
    </section>
  )
}

function UserViewPalace() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [palace, setPalace] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)
  const [crowdData, setCrowdData] = useState(null)
  const [crowdLoading, setCrowdLoading] = useState(true)
  const [crowdError, setCrowdError] = useState('')
  const [reviewData, setReviewData] = useState(null)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState('')
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const canScanQr = Boolean(token && role === 'user')

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

  useEffect(() => {
    const controller = new AbortController()

    Promise.resolve()
      .then(() => {
        setReviewsLoading(true)
        setReviewsError('')
        return axios.get(`${API_BASE_URL}review/public/${id}`, { signal: controller.signal })
      })
      .then((response) => setReviewData(response?.data || null))
      .catch((requestError) => {
        if (requestError?.code !== 'ERR_CANCELED') {
          setReviewData(null)
          setReviewsError(requestError?.response?.data?.message || 'Unable to load reviews.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setReviewsLoading(false)
      })

    return () => controller.abort()
  }, [id])

  useEffect(() => {
    const controller = new AbortController()

    Promise.resolve()
      .then(() => {
        setCrowdLoading(true)
        setCrowdError('')
        return axios.get(`${API_BASE_URL}checkin/crowd/${id}`, { signal: controller.signal })
      })
      .then((response) => setCrowdData(response?.data || null))
      .catch((requestError) => {
        if (requestError?.code !== 'ERR_CANCELED') {
          setCrowdData(null)
          setCrowdError(requestError?.response?.data?.message || 'Unable to load crowd information.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCrowdLoading(false)
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

        <CrowdPreview data={crowdData} loading={crowdLoading} error={crowdError} />
        <ReviewPreview data={reviewData} loading={reviewsLoading} error={reviewsError} />

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

              {canScanQr ? (
                <button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                >
                  <QrCode size={19} aria-hidden="true" />
                  Scan QR
                </button>
              ) : !token ? (
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-950"
                >
                  <LogIn size={19} aria-hidden="true" />
                  Login to scan QR
                </button>
              ) : null}
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

        <CrowdInformation data={crowdData} loading={crowdLoading} error={crowdError} />
      </div>

      {scannerOpen && canScanQr && <QrScannerModal onClose={() => setScannerOpen(false)} />}
    </main>
  )
}

export default UserViewPalace
