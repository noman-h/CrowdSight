import axios from 'axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  BarChart3,
  Building2,
  Landmark,
  Map,
  MapPin,
  PieChart,
  RefreshCw,
  Users,
} from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_URL

const resources = [
  {
    key: 'states',
    label: 'States',
    endpoint: 'location/getallstate',
    statusParam: 'activestatus',
    activeValue: 'true',
    inactiveValue: 'false',
    icon: Map,
    accent: 'blue',
  },
  {
    key: 'cities',
    label: 'Cities',
    endpoint: 'location/getallcity',
    statusParam: 'activestatus',
    activeValue: 'true',
    inactiveValue: 'false',
    icon: Building2,
    accent: 'violet',
  },
  {
    key: 'areas',
    label: 'Areas',
    endpoint: 'location/getallarea',
    statusParam: 'activestatus',
    activeValue: 'true',
    inactiveValue: 'false',
    icon: MapPin,
    accent: 'cyan',
  },
  {
    key: 'admins',
    label: 'Admins',
    endpoint: 'admin/getalladmins',
    statusParam: 'activestatus',
    activeValue: 'active',
    inactiveValue: 'inactive',
    icon: Users,
    accent: 'amber',
  },
  {
    key: 'palaces',
    label: 'Palaces',
    endpoint: 'palace/getallpalaces',
    statusParam: 'activestatus',
    activeValue: 'true',
    inactiveValue: 'false',
    icon: Landmark,
    accent: 'rose',
  },
]

const accentStyles = {
  blue: {
    icon: 'border-blue-200 bg-blue-50 text-blue-700 shadow-blue-100/80 dark:border-blue-800/80 dark:bg-blue-950/70 dark:text-blue-300 dark:shadow-none',
    bar: 'bg-blue-500',
    glow: 'from-blue-500/15',
  },
  violet: {
    icon: 'border-violet-200 bg-violet-50 text-violet-700 shadow-violet-100/80 dark:border-violet-800/80 dark:bg-violet-950/70 dark:text-violet-300 dark:shadow-none',
    bar: 'bg-violet-500',
    glow: 'from-violet-500/15',
  },
  cyan: {
    icon: 'border-cyan-200 bg-cyan-50 text-cyan-700 shadow-cyan-100/80 dark:border-cyan-800/80 dark:bg-cyan-950/70 dark:text-cyan-300 dark:shadow-none',
    bar: 'bg-cyan-500',
    glow: 'from-cyan-500/15',
  },
  amber: {
    icon: 'border-amber-200 bg-amber-50 text-amber-700 shadow-amber-100/80 dark:border-amber-800/80 dark:bg-amber-950/70 dark:text-amber-300 dark:shadow-none',
    bar: 'bg-amber-500',
    glow: 'from-amber-500/15',
  },
  rose: {
    icon: 'border-rose-200 bg-rose-50 text-rose-700 shadow-rose-100/80 dark:border-rose-800/80 dark:bg-rose-950/70 dark:text-rose-300 dark:shadow-none',
    bar: 'bg-rose-500',
    glow: 'from-rose-500/15',
  },
}

const numberFormatter = new Intl.NumberFormat('en-IN')

function getCount(response) {
  return Number(response?.data?.totalcount ?? 0)
}

async function requestCount(resource, statusValue, signal) {
  const token = localStorage.getItem('token')
  const params = { page: 1, limit: 1 }

  if (statusValue !== undefined) params[resource.statusParam] = statusValue

  const response = await axios.get(`${API_BASE_URL}${resource.endpoint}`, {
    params,
    signal,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })

  return getCount(response)
}

async function loadResourceStats(resource, signal) {
  const [total, active, inactive] = await Promise.all([
    requestCount(resource, undefined, signal),
    requestCount(resource, resource.activeValue, signal),
    requestCount(resource, resource.inactiveValue, signal),
  ])

  return [resource.key, { total, active, inactive }]
}

function createEmptyStats() {
  return Object.fromEntries(resources.map(({ key }) => [key, null]))
}

function DonutChart({ total, active, inactive, size = 'small' }) {
  const safeTotal = Math.max(total, 0)
  const activePercent = safeTotal ? Math.min(100, (active / safeTotal) * 100) : 0
  const inactivePercent = safeTotal ? Math.min(100 - activePercent, (inactive / safeTotal) * 100) : 0
  const inactiveEnd = activePercent + inactivePercent
  const dimensions = size === 'large' ? 'h-28 w-28' : 'h-14 w-14'
  const innerDimensions = size === 'large' ? 'inset-3.5' : 'inset-1.5'
  const background = safeTotal
    ? `conic-gradient(var(--chart-active) 0% ${activePercent}%, var(--chart-inactive) ${activePercent}% ${inactiveEnd}%, var(--chart-other) ${inactiveEnd}% 100%)`
    : 'conic-gradient(var(--chart-empty) 0% 100%)'

  return (
    <div
      className={`relative shrink-0 rounded-full shadow-inner [--chart-active:#10b981] [--chart-empty:#cbd5e1] [--chart-inactive:#f59e0b] [--chart-other:#94a3b8] dark:[--chart-active:#34d399] dark:[--chart-empty:#334155] dark:[--chart-inactive:#fbbf24] dark:[--chart-other:#64748b] ${dimensions}`}
      style={{ background }}
      role="img"
      aria-label={`${active} active, ${inactive} inactive, ${Math.max(total - active - inactive, 0)} other`}
    >
      <div className={`absolute ${innerDimensions} flex items-center justify-center rounded-full bg-white dark:bg-slate-900`}>
        <span className={`${size === 'large' ? 'text-base' : 'text-[10px]'} font-black text-slate-800 dark:text-white`}>
          {safeTotal ? `${Math.round(activePercent)}%` : '0%'}
        </span>
      </div>
    </div>
  )
}

function DashboardCard({ resource, data, onNavigate }) {
  const Icon = resource.icon
  const styles = accentStyles[resource.accent]
  const other = data ? Math.max(data.total - data.active - data.inactive, 0) : 0

  return (
    <button
      type="button"
      onClick={() => onNavigate(resource.key)}
      className="group relative min-w-0 overflow-hidden rounded-xl border border-slate-200/80 bg-white p-3.5 text-left shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:focus-visible:ring-offset-slate-950"
      aria-label={`Manage ${resource.label}`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-linear-to-br ${styles.glow} via-transparent to-transparent opacity-70`} />
      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg border shadow-sm transition duration-300 group-hover:scale-105 ${styles.icon}`}>
            <Icon size={18} aria-hidden="true" />
          </div>
          {data ? <DonutChart {...data} /> : <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800" />}
        </div>

        <div className="mt-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total {resource.label}</p>
          <p className="mt-0.5 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {data ? numberFormatter.format(data.total) : '—'}
          </p>
        </div>

        <div className="mt-2.5 grid grid-cols-3 gap-1.5 border-t border-slate-100 pt-2.5 dark:border-slate-800">
          {[
            ['Active', data?.active, 'bg-emerald-500'],
            ['Inactive', data?.inactive, 'bg-amber-500'],
            ['Other', data ? other : null, 'bg-slate-400'],
          ].map(([label, value, color]) => (
            <div key={label}>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <span className={`h-1.5 w-1.5 rounded-full ${color}`} /> {label}
              </div>
              <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-100">
                {value === null || value === undefined ? '—' : numberFormatter.format(value)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </button>
  )
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="h-44 animate-pulse rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800" />
          <div className="mt-5 h-3 w-20 rounded bg-slate-100 dark:bg-slate-800" />
          <div className="mt-2 h-7 w-16 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  )
}

function SuperadminDashboard({ onNavigate }) {
  const [stats, setStats] = useState(createEmptyStats)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchDashboard = useCallback(async (signal, isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError('')

    try {
      const settledResults = await Promise.allSettled(
        resources.map((resource) => loadResourceStats(resource, signal)),
      )

      if (signal?.aborted) return

      const nextStats = createEmptyStats()
      const failedResources = []

      settledResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const [key, values] = result.value
          nextStats[key] = values
        } else if (result.reason?.code !== 'ERR_CANCELED') {
          failedResources.push(resources[index].label)
        }
      })

      setStats(nextStats)
      setLastUpdated(new Date())
      if (failedResources.length) setError(`Unable to load: ${failedResources.join(', ')}.`)
    } catch (requestError) {
      if (requestError?.code !== 'ERR_CANCELED') {
        setError(requestError?.response?.data?.message || 'Unable to load dashboard statistics.')
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    Promise.resolve().then(() => fetchDashboard(controller.signal))
    return () => controller.abort()
  }, [fetchDashboard])

  const chartRows = useMemo(
    () => resources.map((resource) => ({ ...resource, data: stats[resource.key] })),
    [stats],
  )
  const maximumTotal = useMemo(
    () => Math.max(1, ...chartRows.map(({ data }) => data?.total || 0)),
    [chartRows],
  )
  const combined = useMemo(
    () => chartRows.reduce(
      (totals, resource) => ({
        total: totals.total + (resource.data?.total || 0),
        active: totals.active + (resource.data?.active || 0),
        inactive: totals.inactive + (resource.data?.inactive || 0),
      }),
      { total: 0, active: 0, inactive: 0 },
    ),
    [chartRows],
  )

  const handleRefresh = () => fetchDashboard(undefined, true)
  const combinedOther = Math.max(combined.total - combined.active - combined.inactive, 0)

  return (
    <section className="space-y-5 pb-6">
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-700 via-indigo-700 to-violet-800 p-6 text-white shadow-xl shadow-blue-950/15 sm:p-8">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-200">Platform overview</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Welcome, Superadmin</h2>
            <p className="mt-2 text-sm leading-6 text-blue-100/90">Live totals and status distribution from your management APIs.</p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold backdrop-blur transition hover:bg-white/20 disabled:cursor-wait disabled:opacity-70"
          >
            <RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} aria-hidden="true" />
            {refreshing ? 'Refreshing...' : 'Refresh data'}
          </button>
        </div>
        <p className="relative mt-5 text-xs text-blue-200">
          {lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Loading latest statistics...'}
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertCircle size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div><p className="font-bold">Some dashboard data is unavailable</p><p className="mt-1">{error}</p></div>
        </div>
      )}

      {loading ? <DashboardSkeleton /> : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {resources.map((resource) => (
            <DashboardCard
              key={resource.key}
              resource={resource}
              data={stats[resource.key]}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}

      {!loading && (
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/80 transition-colors dark:border-blue-800/80 dark:bg-blue-950/70 dark:text-blue-300 dark:shadow-none">
                <BarChart3 size={20} aria-hidden="true" />
              </div>
              <div><h3 className="font-bold text-slate-900 dark:text-white">Resource comparison</h3><p className="text-xs text-slate-500 dark:text-slate-400">Total records by resource</p></div>
            </div>
            <div className="mt-4 space-y-2.5">
              {chartRows.map((resource) => {
                const width = resource.data ? Math.max(2, (resource.data.total / maximumTotal) * 100) : 0
                return (
                  <div key={resource.key}>
                    <div className="mb-1 flex justify-between gap-3 text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{resource.label}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{resource.data ? numberFormatter.format(resource.data.total) : 'Unavailable'}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className={`h-full rounded-full ${accentStyles[resource.accent].bar} transition-all duration-700`} style={{ width: `${width}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </article>

          <article className="min-w-0 self-start rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-200 bg-violet-50 text-violet-700 shadow-sm shadow-violet-100/80 transition-colors dark:border-violet-800/80 dark:bg-violet-950/70 dark:text-violet-300 dark:shadow-none">
                <PieChart size={20} aria-hidden="true" />
              </div>
              <div><h3 className="font-bold text-slate-900 dark:text-white">Overall status</h3><p className="text-xs text-slate-500 dark:text-slate-400">Combined status distribution</p></div>
            </div>
            <div className="mt-4 grid items-center gap-4 sm:grid-cols-[7rem_minmax(0,1fr)]">
              <div className="flex justify-center">
                <DonutChart {...combined} size="large" />
              </div>
              <div className="grid min-w-0 gap-1.5">
                {[
                  ['Active', combined.active, 'bg-emerald-500 dark:bg-emerald-400'],
                  ['Inactive', combined.inactive, 'bg-amber-500 dark:bg-amber-400'],
                  ['Other', combinedOther, 'bg-slate-400 dark:bg-slate-500'],
                ].map(([label, value, color]) => (
                  <div key={label} className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 transition-colors dark:border-slate-700/80 dark:bg-slate-800">
                    <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400"><span className={`h-2 w-2 shrink-0 rounded-full ${color}`} /> <span className="truncate">{label}</span></div>
                    <p className="shrink-0 font-bold text-slate-900 dark:text-white">{numberFormatter.format(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      )}
    </section>
  )
}

export default SuperadminDashboard
