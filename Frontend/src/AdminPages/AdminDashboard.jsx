import axios from 'axios'
import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  DoorOpen,
  RefreshCw,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_URL
const numberFormatter = new Intl.NumberFormat('en-IN')

const rangeOptions = [
  { value: 1, label: 'Today' },
  { value: 7, label: 'This week' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
]

function TimePeriodSelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const listId = useId()
  const selectedIndex = rangeOptions.findIndex((option) => option.value === value)

  useEffect(() => {
    if (!open) return
    document.getElementById(`${listId}-option-${selectedIndex}`)?.focus()
    const dismiss = (event) => {
      if (!document.getElementById(`${listId}-container`)?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [open, selectedIndex, listId])

  return (
    <div
      id={`${listId}-container`}
      className="relative min-w-0 flex-1 lg:w-52"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          setOpen(false)
          document.getElementById(`${listId}-trigger`)?.focus()
        }
      }}
    >
      <span id={`${listId}-label`} className="mb-2 block text-xs font-semibold tracking-wide text-blue-200">Time period</span>
      <button
        id={`${listId}-trigger`}
        type="button"
        aria-labelledby={`${listId}-label ${listId}-value`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            setOpen(true)
          }
        }}
        className={`flex h-12 w-full cursor-pointer items-center gap-3 rounded-xl border px-3.5 text-left text-sm font-semibold text-white shadow-sm outline-none transition hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-blue-400 ${open ? 'border-blue-400 bg-white/15 ring-2 ring-blue-400/30' : 'border-white/25 bg-white/10'}`}
      >
        <CalendarDays size={18} className="shrink-0 text-blue-200" aria-hidden="true" />
        <span id={`${listId}-value`} className="min-w-0 flex-1 truncate">{rangeOptions[selectedIndex]?.label}</span>
        <ChevronDown size={17} className={`shrink-0 text-blue-200 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div id={listId} role="listbox" aria-labelledby={`${listId}-label`} className="absolute left-0 right-0 z-50 mt-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-950/20 dark:border-slate-700 dark:bg-slate-900">
          {rangeOptions.map((option, index) => (
            <button
              id={`${listId}-option-${index}`}
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              tabIndex={-1}
              onKeyDown={(event) => {
                let nextIndex
                if (event.key === 'ArrowDown') nextIndex = (index + 1) % rangeOptions.length
                if (event.key === 'ArrowUp') nextIndex = (index - 1 + rangeOptions.length) % rangeOptions.length
                if (event.key === 'Home') nextIndex = 0
                if (event.key === 'End') nextIndex = rangeOptions.length - 1
                if (nextIndex !== undefined) {
                  event.preventDefault()
                  document.getElementById(`${listId}-option-${nextIndex}`)?.focus()
                }
              }}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
                document.getElementById(`${listId}-trigger`)?.focus()
              }}
              className={`flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 text-left text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400 ${value === option.value ? 'bg-blue-50 font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'}`}
            >
              {option.label}
              {value === option.value && <Check size={16} className="shrink-0" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function toDateInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDateRange(days) {
  const end = new Date()
  const start = new Date(end)

  if (days === 7) {
    const daysSinceMonday = (end.getDay() + 6) % 7
    start.setDate(end.getDate() - daysSinceMonday)
  } else {
    start.setDate(end.getDate() - (days - 1))
  }
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function getId(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return String(value._id || value.id || '')
}

function formatDateTime(value) {
  if (!value) return 'Not available'
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

function StatCard({ icon: Icon, label, value, description, color, onClick }) {
  const colors = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
    violet: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-300',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    amber: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  }

  const content = (
    <>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${colors[color]}`}>
        <Icon size={20} aria-hidden="true" />
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
        {value === null ? '—' : numberFormatter.format(value)}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        {onClick && <ArrowRight size={16} className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5" aria-hidden="true" />}
      </div>
    </>
  )

  const className = 'group min-w-0 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-900'

  return onClick ? (
    <button type="button" onClick={onClick} className={className} aria-label={`Open ${label}`}>
      {content}
    </button>
  ) : (
    <article className={className}>{content}</article>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading admin dashboard">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800" />
            <div className="mt-5 h-3 w-24 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="mt-3 h-8 w-16 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-72 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800 lg:col-span-2" />
        <div className="h-72 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  )
}

function AdminDashboard({ onNavigate }) {
  const [days, setDays] = useState(7)
  const [palaces, setPalaces] = useState([])
  const [totalPalaces, setTotalPalaces] = useState(null)
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [errors, setErrors] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [selectedDayKey, setSelectedDayKey] = useState(null)

  const loadDashboard = useCallback(async (signal, isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setErrors([])

    const adminId = localStorage.getItem('userid')
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined
    const { start, end } = getDateRange(days)

    const palaceRequest = axios.get(`${API_BASE_URL}palace/getallpalaces`, {
      signal,
      headers,
      params: { adminsort: adminId, sort: 'newest', page: 1, limit: 5000 },
    })
    const checkinRequest = axios.get(`${API_BASE_URL}checkin/getall`, {
      signal,
      headers,
      params: {
        fromdate: toDateInputValue(start),
        todate: toDateInputValue(end),
        sort: 'newest',
        page: 1,
        limit: 5000,
      },
    })

    try {
      const [palaceResult, checkinResult] = await Promise.allSettled([palaceRequest, checkinRequest])
      if (signal?.aborted) return

      const nextErrors = []
      let ownedPalaces = []

      if (palaceResult.status === 'fulfilled') {
        ownedPalaces = palaceResult.value?.data?.response || []
        setPalaces(ownedPalaces)
        setTotalPalaces(palaceResult.value?.data?.totalcount ?? ownedPalaces.length)
      } else if (palaceResult.reason?.code !== 'ERR_CANCELED') {
        setPalaces([])
        setTotalPalaces(null)
        nextErrors.push('palace totals')
      }

      if (checkinResult.status === 'fulfilled') {
        const palaceIds = new Set(ownedPalaces.map((palace) => getId(palace)))
        const allCheckins = checkinResult.value?.data?.result || []
        const adminCheckins = allCheckins.filter((checkin) => {
          const palace = checkin.palaceid
          return palaceIds.has(getId(palace)) || getId(palace?.adminid) === adminId
        })
        setCheckins(adminCheckins)
      } else if (checkinResult.reason?.code !== 'ERR_CANCELED') {
        setCheckins([])
        nextErrors.push('crowd activity')
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

  const { start: rangeStart } = useMemo(() => getDateRange(days), [days])

  const newPalaces = useMemo(
    () => palaces.filter((palace) => {
      const createdAt = new Date(palace.createdAt)
      return !Number.isNaN(createdAt.getTime()) && createdAt >= rangeStart
    }),
    [palaces, rangeStart],
  )

  const crowdStats = useMemo(() => {
    const active = checkins.filter((item) => item.status === 'checkedin').length
    const checkedOut = checkins.filter((item) => item.status === 'checkedout').length
    const visitors = new Set(checkins.map((item) => getId(item.userid)).filter(Boolean)).size
    return { active, checkedOut, visitors }
  }, [checkins])

  const dailyActivity = useMemo(() => {
    const rows = []
    const activityByDay = new Map()
    checkins.forEach((item) => {
      const date = new Date(item.checkintime)
      if (!Number.isNaN(date.getTime())) {
        const key = toDateInputValue(date)
        activityByDay.set(key, (activityByDay.get(key) || 0) + 1)
      }
    })

    for (let offset = 0; offset < days; offset += 1) {
      const date = new Date(rangeStart)
      date.setDate(rangeStart.getDate() + offset)
      rows.push({
        key: toDateInputValue(date),
        label: days === 7
          ? date.toLocaleDateString([], { weekday: 'short' })
          : date.toLocaleDateString([], { day: '2-digit', month: 'short' }),
        fullLabel: days === 7
          ? date.toLocaleDateString([], { weekday: 'long', day: '2-digit', month: 'short' })
          : date.toLocaleDateString([], { day: '2-digit', month: 'long' }),
        total: activityByDay.get(toDateInputValue(date)) || 0,
        dayKeys: [toDateInputValue(date)],
      })
    }
    return rows
  }, [checkins, days, rangeStart])

  const chartRows = useMemo(() => {
    if (dailyActivity.length <= 14) return dailyActivity
    const bucketSize = days === 30 ? 3 : 7
    const buckets = []
    for (let index = 0; index < dailyActivity.length; index += bucketSize) {
      const group = dailyActivity.slice(index, index + bucketSize)
      buckets.push({
        key: group[0].key,
        label: group[0].label,
        fullLabel: `${group[0].label} – ${group[group.length - 1].label}`,
        total: group.reduce((sum, item) => sum + item.total, 0),
        dayKeys: group.flatMap((item) => item.dayKeys),
      })
    }
    return buckets
  }, [dailyActivity, days])

  const maximumActivity = Math.max(1, ...chartRows.map((item) => item.total))

  const selectedDay = chartRows.find((item) => item.key === selectedDayKey) || null

  const hourlyCrowd = useMemo(() => {
    if (!selectedDay) return []

    return Array.from({ length: 24 }, (_, hour) => {
      const total = selectedDay.dayKeys.reduce((dayTotal, dayKey) => {
        const hourStart = new Date(`${dayKey}T00:00:00`)
        hourStart.setHours(hour, 0, 0, 0)
        const hourEnd = new Date(hourStart)
        hourEnd.setHours(hour + 1)

        const crowdDuringHour = checkins.filter((checkin) => {
          const checkinTime = new Date(checkin.checkintime)
          const checkoutTime = checkin.checkouttime ? new Date(checkin.checkouttime) : new Date()
          if (Number.isNaN(checkinTime.getTime()) || Number.isNaN(checkoutTime.getTime())) return false
          return checkinTime < hourEnd && checkoutTime > hourStart
        }).length

        return dayTotal + crowdDuringHour
      }, 0)

      const label = formatHour(hour)
      return { hour, label, total }
    })
  }, [checkins, selectedDay])

  const maximumHourlyCrowd = Math.max(1, ...hourlyCrowd.map((item) => item.total))

  const palaceCrowd = useMemo(() => {
    const totals = new Map()
    palaces.forEach((palace) => totals.set(getId(palace), { palace, total: 0, active: 0 }))
    checkins.forEach((checkin) => {
      const palaceId = getId(checkin.palaceid)
      const existing = totals.get(palaceId)
      if (existing) {
        existing.total += 1
        if (checkin.status === 'checkedin') existing.active += 1
      }
    })
    return [...totals.values()].sort((a, b) => b.total - a.total).slice(0, 5)
  }, [checkins, palaces])

  const rangeLabel = rangeOptions.find((option) => option.value === days)?.label || `${days} days`

  return (
    <section className="space-y-5 pb-6">
      <div className="relative z-10 rounded-3xl bg-linear-to-br from-slate-900 via-blue-950 to-indigo-900 p-6 text-white shadow-xl sm:p-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">Area overview</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Palace & crowd dashboard</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Monitor your palaces and visitor activity for the selected period.</p>
          </div>
          <div className="flex w-full items-end gap-2 lg:w-auto lg:shrink-0">
            <TimePeriodSelect value={days} onChange={(value) => {
              setDays(value)
              setSelectedDayKey(null)
            }} />
            <button
              type="button"
              onClick={() => loadDashboard(undefined, true)}
              disabled={refreshing}
              aria-label={refreshing ? 'Refreshing dashboard' : 'Refresh dashboard'}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-bold backdrop-blur transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-wait disabled:opacity-70"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} aria-hidden="true" />
              <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
        <p className="relative mt-5 text-xs text-slate-400">
          {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}` : 'Loading latest activity...'}
        </p>
      </div>

      {errors.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertCircle size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-bold">Some dashboard data is unavailable</p>
            <p className="mt-1 capitalize">Unable to load {errors.join(' and ')}.</p>
          </div>
        </div>
      )}

      {loading ? <DashboardSkeleton /> : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Building2} label="Total palaces" value={totalPalaces} description="Assigned to your area" color="blue" onClick={onNavigate ? () => onNavigate('palaces') : undefined} />
            <StatCard icon={Sparkles} label="New palaces" value={newPalaces.length} description={`Added in ${rangeLabel.toLowerCase()}`} color="violet" onClick={onNavigate ? () => onNavigate('palaces') : undefined} />
            <StatCard icon={UserCheck} label="Area check-ins" value={errors.includes('crowd activity') ? null : checkins.length} description={rangeLabel} color="emerald" />
            <StatCard icon={Activity} label="Current crowd" value={errors.includes('crowd activity') ? null : crowdStats.active} description={`${numberFormatter.format(crowdStats.checkedOut)} completed visits`} color="amber" />
          </div>

          <div className="grid items-start gap-4 lg:grid-cols-3">
            <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5 lg:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Crowd activity</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Check-ins during {rangeLabel.toLowerCase()}</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><Users size={15} /> {crowdStats.visitors} visitors</span>
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"><DoorOpen size={15} /> {crowdStats.active} inside</span>
                </div>
              </div>

              <div className="mt-6 flex h-48 items-end gap-1.5 sm:gap-2" role="group" aria-label={`Check-in activity for ${rangeLabel.toLowerCase()}`}>
                {chartRows.map((item) => {
                  const height = item.total ? Math.max(8, (item.total / maximumActivity) * 100) : 2
                  const isSelected = selectedDayKey === item.key
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSelectedDayKey(isSelected ? null : item.key)}
                      className="group flex h-full min-w-0 flex-1 flex-col justify-end rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                      aria-label={`Show hourly crowd for ${item.fullLabel || item.label}`}
                      aria-pressed={isSelected}
                    >
                      <div className="relative flex flex-1 items-end">
                        <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-bold text-white shadow-lg group-hover:block dark:bg-slate-700">
                          {item.fullLabel || item.label}: {item.total} check-ins
                        </span>
                        <div className={`w-full rounded-t-md bg-linear-to-t transition-all duration-500 ${isSelected ? 'from-violet-700 to-fuchsia-400 ring-2 ring-violet-300 ring-offset-2 dark:ring-offset-slate-900' : 'from-blue-600 to-cyan-400 group-hover:from-blue-500 group-hover:to-cyan-300'}`} style={{ height: `${height}%` }} />
                      </div>
                      <span className={`mt-2 truncate text-center text-[9px] font-bold sm:text-[10px] ${isSelected ? 'text-violet-600 dark:text-violet-300' : 'text-slate-400'}`}>{item.label}</span>
                    </button>
                  )
                })}
              </div>

              {selectedDay ? (
                <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Hourly crowd · {selectedDay.fullLabel || selectedDay.label}</h4>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Estimated people inside during each hour</p>
                    </div>
                    <button type="button" onClick={() => setSelectedDayKey(null)} className="text-xs font-bold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">Close</button>
                  </div>
                  <div className="mt-4 overflow-x-auto pb-2">
                    <div className="flex h-44 min-w-200 items-end gap-2" role="img" aria-label={`Hourly crowd for ${selectedDay.fullLabel || selectedDay.label}`}>
                      {hourlyCrowd.map((item) => {
                        const height = item.total ? Math.max(8, (item.total / maximumHourlyCrowd) * 100) : 2
                        return (
                          <div key={item.hour} className="group flex h-full min-w-0 flex-1 flex-col justify-end">
                            <div className="relative flex flex-1 items-end">
                              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-bold text-white shadow-lg group-hover:block dark:bg-slate-700">
                                {item.label}: {item.total} {item.total === 1 ? 'person' : 'people'}
                              </span>
                              <div className="w-full rounded-t-sm bg-linear-to-t from-violet-700 to-fuchsia-400 transition-all duration-500 group-hover:from-violet-600 group-hover:to-fuchsia-300" style={{ height: `${height}%` }} />
                            </div>
                            <span className="mt-2 truncate text-center text-[9px] font-medium text-slate-400">{item.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-4 border-t border-slate-100 pt-4 text-center text-xs font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">Click a day to see the crowd by hour.</p>
              )}
            </article>

            <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
              <h3 className="font-bold text-slate-900 dark:text-white">Crowd by palace</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Top palace activity in this period</p>
              <div className="mt-4 space-y-3">
                {palaceCrowd.length > 0 ? palaceCrowd.map(({ palace, total, active }) => (
                  <div key={getId(palace)} className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700/70 dark:bg-slate-800/70">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold capitalize text-slate-800 dark:text-slate-100">{palace.name || 'Unnamed palace'}</p>
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{total} visits</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{active} inside</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${checkins.length ? Math.max(2, (total / checkins.length) * 100) : 0}%` }} />
                    </div>
                  </div>
                )) : (
                  <div className="flex min-h-48 items-center justify-center text-center text-sm text-slate-500 dark:text-slate-400">No palaces are available.</div>
                )}
              </div>
            </article>
          </div>

          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-5">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Recent area check-ins</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Latest visitor movement at your palaces</p>
              </div>
              <Clock3 size={19} className="text-slate-400" aria-hidden="true" />
            </div>
            {checkins.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-125 text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
                    <tr><th className="px-5 py-3">Palace</th><th className="px-5 py-3">Check-in time</th><th className="px-5 py-3">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {checkins.slice(0, 8).map((checkin) => (
                      <tr key={getId(checkin)} className="text-slate-700 dark:text-slate-300">
                        <td className="px-5 py-3 font-semibold capitalize text-slate-900 dark:text-white">{checkin.palaceid?.name || 'Unknown palace'}</td>
                        <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{formatDateTime(checkin.checkintime)}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${checkin.status === 'checkedin' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                            {checkin.status === 'checkedin' ? 'Inside' : 'Checked out'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400">No check-ins found for {rangeLabel.toLowerCase()}.</div>
            )}
          </article>
        </>
      )}
    </section>
  )
}

export default AdminDashboard
