import axios from 'axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertCircle,
  CalendarDays,
  Clock3,
  MessageSquareText,
  RefreshCw,
  Star,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_URL
const numberFormatter = new Intl.NumberFormat('en-IN')

const rangeOptions = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
]

function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDateRange(days) {
  const end = new Date()
  const start = new Date(end)
  start.setDate(end.getDate() - (days - 1))
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function formatDateTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not available'
  return date.toLocaleString([], {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function formatHour(hour) {
  const displayHour = hour % 12 || 12
  return `${displayHour} ${hour < 12 ? 'AM' : 'PM'}`
}

function getId(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return String(value._id || value.id || '')
}

function MetricCard({ icon: Icon, label, value, description, color, onClick }) {
  const iconColors = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
    violet: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-300',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    amber: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  }
  const className = 'min-w-0 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-900'
  const content = (
    <>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${iconColors[color]}`}><Icon size={20} aria-hidden="true" /></div>
      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{description}</p>
    </>
  )

  return onClick ? <button type="button" onClick={onClick} className={className}>{content}</button> : <article className={className}>{content}</article>
}

function RatingStars({ rating, size = 14 }) {
  return (
    <span className="inline-flex" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} size={size} className={index < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-300 dark:fill-slate-800 dark:text-slate-600'} aria-hidden="true" />
      ))}
    </span>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-44 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-3"><div className="h-72 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800 lg:col-span-2" /><div className="h-72 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" /></div>
    </div>
  )
}

function PalaceDashboard({ onNavigate }) {
  const [days, setDays] = useState(7)
  const [checkins, setCheckins] = useState([])
  const [reviews, setReviews] = useState([])
  const [reviewSummary, setReviewSummary] = useState({ total: 0, average: 0 })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [errors, setErrors] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()))

  const loadDashboard = useCallback(async (signal, isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setErrors([])

    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined
    const { start, end } = getDateRange(days)

    const requests = [
      axios.get(`${API_BASE_URL}checkin/getall`, {
        signal,
        headers,
        params: { fromdate: toDateKey(start), todate: toDateKey(end), sort: 'newest', page: 1, limit: 5000 },
      }),
      axios.get(`${API_BASE_URL}review/getall`, {
        signal,
        headers,
        params: { page: 1, limit: 5 },
      }),
    ]

    try {
      const [checkinResult, reviewResult] = await Promise.allSettled(requests)
      if (signal?.aborted) return
      const nextErrors = []

      if (checkinResult.status === 'fulfilled') {
        setCheckins(checkinResult.value?.data?.result || [])
      } else if (checkinResult.reason?.code !== 'ERR_CANCELED') {
        setCheckins([])
        nextErrors.push('check-in details')
      }

      if (reviewResult.status === 'fulfilled') {
        const response = reviewResult.value?.data || {}
        setReviews(response.result || [])
        setReviewSummary({ total: response.totalcount || 0, average: Number(response.averageRating || 0) })
      } else if (reviewResult.reason?.code !== 'ERR_CANCELED') {
        setReviews([])
        setReviewSummary({ total: 0, average: 0 })
        nextErrors.push('reviews')
      }

      setErrors(nextErrors)
      setLastUpdated(new Date())
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [days])

  useEffect(() => {
    const controller = new AbortController()
    Promise.resolve().then(() => loadDashboard(controller.signal))
    return () => controller.abort()
  }, [loadDashboard])

  const dailyActivity = useMemo(() => {
    const { start } = getDateRange(days)
    const totals = new Map()
    checkins.forEach((checkin) => {
      const date = new Date(checkin.checkintime)
      if (!Number.isNaN(date.getTime())) {
        const key = toDateKey(date)
        totals.set(key, (totals.get(key) || 0) + 1)
      }
    })

    return Array.from({ length: days }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      return {
        key: toDateKey(date),
        label: days === 7 ? date.toLocaleDateString([], { weekday: 'short' }) : date.toLocaleDateString([], { day: '2-digit', month: 'short' }),
        total: totals.get(toDateKey(date)) || 0,
      }
    })
  }, [checkins, days])

  const chartRows = useMemo(() => {
    if (days === 7) return dailyActivity
    const size = days === 30 ? 3 : 7
    const rows = []
    for (let index = 0; index < dailyActivity.length; index += size) {
      const group = dailyActivity.slice(index, index + size)
      rows.push({ key: group[0].key, label: group[0].label, total: group.reduce((sum, row) => sum + row.total, 0) })
    }
    return rows
  }, [dailyActivity, days])

  const todayKey = toDateKey(new Date())
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = toDateKey(yesterday)
  const todayTotal = dailyActivity.find((row) => row.key === todayKey)?.total || 0
  const yesterdayTotal = dailyActivity.find((row) => row.key === yesterdayKey)?.total || 0
  const averageDaily = checkins.length / days
  const currentCrowd = checkins.filter((checkin) => checkin.status === 'checkedin').length
  const maximumActivity = Math.max(1, ...chartRows.map((row) => row.total))
  const rangeLabel = rangeOptions.find((option) => option.value === days)?.label || `${days} days`
  const { start: rangeStart } = getDateRange(days)

  const hourlyCrowd = useMemo(() => {
    return Array.from({ length: 24 }, (_, hour) => {
      const hourStart = new Date(`${selectedDate}T00:00:00`)
      hourStart.setHours(hour, 0, 0, 0)
      const hourEnd = new Date(hourStart)
      hourEnd.setHours(hour + 1)

      const total = checkins.filter((checkin) => {
        const checkinTime = new Date(checkin.checkintime)
        const checkoutTime = checkin.checkouttime ? new Date(checkin.checkouttime) : new Date()
        if (Number.isNaN(checkinTime.getTime()) || Number.isNaN(checkoutTime.getTime())) return false
        return checkinTime < hourEnd && checkoutTime > hourStart
      }).length

      return { hour, label: formatHour(hour), total }
    })
  }, [checkins, selectedDate])

  const maximumHourlyCrowd = Math.max(1, ...hourlyCrowd.map((row) => row.total))
  const selectedDateLabel = new Date(`${selectedDate}T00:00:00`).toLocaleDateString([], {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })

  return (
    <section className="space-y-5 pb-6">
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-800 via-teal-800 to-cyan-900 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">Live palace overview</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Crowd & visitor dashboard</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-100/80">Track visitor activity, recent check-ins, and guest feedback.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative">
              <CalendarDays size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-100" aria-hidden="true" />
              <span className="sr-only">Select dashboard period</span>
              <select value={days} onChange={(event) => {
                setDays(Number(event.target.value))
                setSelectedDate(toDateKey(new Date()))
              }} className="appearance-none rounded-xl border border-white/20 bg-white/10 py-2.5 pl-9 pr-8 text-sm font-bold text-white outline-none backdrop-blur transition hover:bg-white/15 focus:ring-2 focus:ring-emerald-300 [&>option]:text-slate-900">
                {rangeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <button type="button" onClick={() => loadDashboard(undefined, true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold backdrop-blur transition hover:bg-white/20 disabled:cursor-wait disabled:opacity-70">
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} aria-hidden="true" /> {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
        <p className="relative mt-5 text-xs text-emerald-200/70">{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}` : 'Loading latest activity...'}</p>
      </div>

      {errors.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertCircle size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div><p className="font-bold">Some dashboard data is unavailable</p><p className="mt-1">Unable to load {errors.join(' and ')}.</p></div>
        </div>
      )}

      {loading ? <DashboardSkeleton /> : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={TrendingUp} label="Average daily crowd" value={averageDaily.toFixed(1)} description={`Average check-ins over ${rangeLabel.toLowerCase()}`} color="blue" />
            <MetricCard icon={UserCheck} label="Today's check-ins" value={numberFormatter.format(todayTotal)} description="Visitors checked in today" color="emerald" onClick={onNavigate ? () => onNavigate('checkins') : undefined} />
            <MetricCard icon={Clock3} label="Yesterday's check-ins" value={numberFormatter.format(yesterdayTotal)} description="Previous day's visitor count" color="violet" onClick={onNavigate ? () => onNavigate('checkins') : undefined} />
            <MetricCard icon={Activity} label="Current crowd" value={numberFormatter.format(currentCrowd)} description="Visitors currently inside" color="amber" />
          </div>

          <div className="grid items-start gap-4 lg:grid-cols-3">
            <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5 lg:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h3 className="font-bold text-slate-900 dark:text-white">Daily check-ins</h3><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Visitor arrivals during {rangeLabel.toLowerCase()}</p></div>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">{checkins.length} total</span>
              </div>
              <div className="mt-6 flex h-52 items-end gap-1.5 sm:gap-2" role="group" aria-label={`Daily check-ins for ${rangeLabel.toLowerCase()}`}>
                {chartRows.map((row) => {
                  const height = row.total ? Math.max(8, (row.total / maximumActivity) * 100) : 2
                  const isSelected = selectedDate === row.key
                  return (
                    <button key={row.key} type="button" onClick={() => setSelectedDate(row.key)} className="group flex h-full min-w-0 flex-1 flex-col justify-end rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" aria-label={`Show hourly crowd for ${row.label}`} aria-pressed={isSelected}>
                      <div className="relative flex flex-1 items-end">
                        <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-bold text-white shadow-lg group-hover:block dark:bg-slate-700">{row.total} check-ins</span>
                        <div className={`w-full rounded-t-md bg-linear-to-t transition-all duration-500 ${isSelected ? 'from-violet-700 to-fuchsia-400 ring-2 ring-violet-300 ring-offset-2 dark:ring-offset-slate-900' : 'from-emerald-700 to-cyan-400 group-hover:from-emerald-600 group-hover:to-cyan-300'}`} style={{ height: `${height}%` }} />
                      </div>
                      <span className={`mt-2 truncate text-center text-[9px] font-bold sm:text-[10px] ${isSelected ? 'text-violet-600 dark:text-violet-300' : 'text-slate-400'}`}>{row.label}</span>
                    </button>
                  )
                })}
              </div>
            </article>

            <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div><h3 className="font-bold text-slate-900 dark:text-white">Palace reviews</h3><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Latest visitor feedback</p></div>
                <button type="button" onClick={onNavigate ? () => onNavigate('reviews') : undefined} className="rounded-lg p-2 text-violet-600 transition hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-violet-950/50" aria-label="Open all reviews"><MessageSquareText size={19} /></button>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
                <p className="text-3xl font-black text-slate-900 dark:text-white">{reviewSummary.average.toFixed(1)}</p>
                <div><RatingStars rating={reviewSummary.average} /><p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{reviewSummary.total} reviews</p></div>
              </div>
              <div className="mt-4 space-y-3">
                {reviews.length > 0 ? reviews.slice(0, 3).map((review) => (
                  <div key={getId(review)} className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                    <div className="flex items-center justify-between gap-2"><p className="truncate text-xs font-bold capitalize text-slate-800 dark:text-slate-100">{review.userid?.name || 'Guest'}</p><RatingStars rating={review.rating} size={12} /></div>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{review.description || 'No written feedback.'}</p>
                  </div>
                )) : <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">No reviews yet.</div>}
              </div>
            </article>
          </div>

          <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Hourly crowd</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Estimated people inside on {selectedDateLabel}</p>
              </div>
              <label className="relative">
                <span className="sr-only">Select date for hourly crowd</span>
                <CalendarDays size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  type="date"
                  value={selectedDate}
                  min={toDateKey(rangeStart)}
                  max={todayKey}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-bold text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:ring-emerald-950"
                />
              </label>
            </div>
            <div className="mt-5 overflow-x-auto pb-2">
              <div className="flex h-52 min-w-200 items-end gap-2" role="img" aria-label={`Hourly crowd for ${selectedDateLabel}`}>
                {hourlyCrowd.map((row) => {
                  const height = row.total ? Math.max(8, (row.total / maximumHourlyCrowd) * 100) : 2
                  return (
                    <div key={row.hour} className="group flex h-full min-w-0 flex-1 flex-col justify-end">
                      <div className="relative flex flex-1 items-end">
                        <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-bold text-white shadow-lg group-hover:block dark:bg-slate-700">{row.label}: {row.total} {row.total === 1 ? 'person' : 'people'}</span>
                        <div className="w-full rounded-t-sm bg-linear-to-t from-violet-700 to-fuchsia-400 transition-all duration-500 group-hover:from-violet-600 group-hover:to-fuchsia-300" style={{ height: `${height}%` }} />
                      </div>
                      <span className="mt-2 truncate text-center text-[9px] font-medium text-slate-400">{row.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </article>

          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-5">
              <div><h3 className="font-bold text-slate-900 dark:text-white">Recent check-ins</h3><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Latest visitor arrivals at your palace</p></div>
              <button type="button" onClick={onNavigate ? () => onNavigate('checkins') : undefined} className="text-xs font-bold text-emerald-700 transition hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200">View all check-ins</button>
            </div>
            {checkins.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-125 text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-800/70 dark:text-slate-400"><tr><th className="px-5 py-3">Visitor</th><th className="px-5 py-3">Check-in</th><th className="px-5 py-3">Status</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {checkins.slice(0, 8).map((checkin) => (
                      <tr key={getId(checkin)} className="text-slate-700 dark:text-slate-300">
                        <td className="px-5 py-3 font-bold capitalize text-slate-900 dark:text-white"><span className="inline-flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Users size={15} /></span>{checkin.userid?.name || 'Visitor'}</span></td>
                        <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400">{formatDateTime(checkin.checkintime)}</td>
                        <td className="px-5 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${checkin.status === 'checkedin' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{checkin.status === 'checkedin' ? 'Inside' : 'Checked out'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <div className="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400">No visitor check-ins found for this period.</div>}
          </article>
        </>
      )}
    </section>
  )
}

export default PalaceDashboard
