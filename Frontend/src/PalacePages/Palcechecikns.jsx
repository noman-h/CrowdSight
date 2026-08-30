import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import useDebouncing from '../Hooks/UseDebouncing'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  LogIn,
  LogOut,
  Mail,
  Phone,
  RefreshCw,
  Search,
  UserCheck,
  Users,
  X,
} from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_URL

function formatDateTime(value) {
  if (!value) return 'Not available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not available'
  return date.toLocaleString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function formatDuration(checkin) {
  if (!checkin?.checkintime) return 'Not available'
  const start = new Date(checkin.checkintime)
  const end = checkin.checkouttime ? new Date(checkin.checkouttime) : new Date()
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'Not available'
  const minutes = Math.max(0, Math.floor((end - start) / 60000))
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (!hours) return `${remainingMinutes} min`
  return `${hours} hr ${remainingMinutes} min`
}

function getId(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return String(value._id || value.id || '')
}

function StatusBadge({ status }) {
  const isInside = status === 'checkedin'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${isInside ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isInside ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {isInside ? 'Inside' : 'Checked out'}
    </span>
  )
}

function VisitorDetails({ checkin, onClose }) {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const visitor = checkin.userid || {}

  return (
    <div className="fixed inset-0 z-100">
      <button type="button" onClick={onClose} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" aria-label="Close visitor details" />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900" aria-label="Visitor check-in details">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div><p className="text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Check-in details</p><h2 className="mt-1 text-lg font-black text-slate-900 dark:text-white">Visitor information</h2></div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="Close details"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="rounded-2xl bg-linear-to-br from-emerald-700 to-teal-800 p-5 text-white shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15"><Users size={23} /></div>
            <h3 className="mt-4 text-xl font-black capitalize">{visitor.name || 'Visitor'}</h3>
            <div className="mt-3"><StatusBadge status={checkin.status} /></div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Contact</p>
              <div className="mt-3 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <p className="flex items-center gap-3"><Mail size={16} className="shrink-0 text-emerald-600" /><span className="min-w-0 break-all">{visitor.email || 'Email unavailable'}</span></p>
                <p className="flex items-center gap-3"><Phone size={16} className="shrink-0 text-emerald-600" /><span>{visitor.phone || 'Phone unavailable'}</span></p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Visit timeline</p>
              <div className="mt-3 space-y-4">
                <div className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><LogIn size={16} /></span><div><p className="text-xs text-slate-400">Checked in</p><p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-100">{formatDateTime(checkin.checkintime)}</p></div></div>
                <div className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><LogOut size={16} /></span><div><p className="text-xs text-slate-400">Checked out</p><p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-100">{checkin.checkouttime ? formatDateTime(checkin.checkouttime) : 'Still inside'}</p></div></div>
                <div className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"><Clock3 size={16} /></span><div><p className="text-xs text-slate-400">Visit duration</p><p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-100">{formatDuration(checkin)}</p></div></div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

function Palcechecikns() {
  const [checkins, setCheckins] = useState([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncing(search.trim(), 500)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [selectedCheckin, setSelectedCheckin] = useState(null)
  const limit = 10

  const fetchCheckins = useCallback(async (signal, isRefresh = false) => {
    if (fromDate && toDate && fromDate > toDate) {
      setError('From date cannot be after the to date.')
      setLoading(false)
      setRefreshing(false)
      return
    }

    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}checkin/getall`, {
        signal,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        params: { search: debouncedSearch, fromdate: fromDate, todate: toDate, sort, page, limit },
      })
      setCheckins(response?.data?.result || [])
      setTotal(response?.data?.totalcount || 0)
    } catch (requestError) {
      if (requestError?.code !== 'ERR_CANCELED') {
        setCheckins([])
        setTotal(0)
        setError(requestError?.response?.data?.message || 'Unable to load palace check-ins.')
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [debouncedSearch, fromDate, page, sort, toDate])

  useEffect(() => {
    const controller = new AbortController()
    Promise.resolve().then(() => fetchCheckins(controller.signal))
    return () => controller.abort()
  }, [fetchCheckins])

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const today = new Date().toISOString().split('T')[0]

  const handleClearFilters = () => {
    setSearch('')
    setFromDate('')
    setToDate('')
    setSort('newest')
    setPage(1)
  }

  return (
    <section className="space-y-5 pb-6">
      <div className="rounded-3xl bg-linear-to-br from-emerald-800 via-teal-800 to-cyan-900 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">Visitor management</p><h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Palace check-ins</h2><p className="mt-2 text-sm text-emerald-100/80">Browse visits and open a visitor to view their contact and check-in details.</p></div>
          <button type="button" onClick={() => fetchCheckins(undefined, true)} disabled={refreshing} className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold transition hover:bg-white/20 disabled:cursor-wait disabled:opacity-70"><RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />{refreshing ? 'Refreshing...' : 'Refresh'}</button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(12rem,1fr)_auto_auto_auto_auto]">
          <label className="relative"><span className="sr-only">Search visitor</span><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search visitor name" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-950" /></label>
          <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">From date</span><input type="date" value={fromDate} max={toDate || today} onChange={(event) => { setFromDate(event.target.value); setPage(1) }} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" /></label>
          <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">To date</span><input type="date" value={toDate} min={fromDate || undefined} max={today} onChange={(event) => { setToDate(event.target.value); setPage(1) }} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" /></label>
          <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Sort</span><select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1) }} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label>
          <div className="flex items-end"><button type="button" onClick={handleClearFilters} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Clear</button></div>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</div>}

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800"><div><h3 className="font-bold text-slate-900 dark:text-white">Visitors</h3><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{total} check-in records found</p></div><UserCheck size={20} className="text-emerald-600" /></div>
        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400"><RefreshCw size={18} className="animate-spin" />Loading check-ins...</div>
        ) : checkins.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center"><CalendarDays size={36} className="text-slate-300 dark:text-slate-700" /><p className="mt-3 font-bold text-slate-700 dark:text-slate-200">No check-ins found</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try changing the search or date filters.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-800/70 dark:text-slate-400"><tr><th className="px-5 py-3">Visitor</th><th className="px-5 py-3">Check-in</th><th className="px-5 py-3">Checkout</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Action</th></tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {checkins.map((checkin) => (
                  <tr key={getId(checkin)} className="text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-3 font-bold capitalize text-slate-900 dark:text-white">{checkin.userid?.name || 'Visitor'}</td>
                    <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400">{formatDateTime(checkin.checkintime)}</td>
                    <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400">{checkin.checkouttime ? formatDateTime(checkin.checkouttime) : '—'}</td>
                    <td className="px-5 py-3"><StatusBadge status={checkin.status} /></td>
                    <td className="px-5 py-3 text-right"><button type="button" onClick={() => setSelectedCheckin(checkin)} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-950"><Eye size={14} />View details</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && total > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</p>
            <div className="flex items-center gap-2"><button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Previous page"><ChevronLeft size={17} /></button><span className="min-w-20 text-center text-xs font-bold text-slate-700 dark:text-slate-300">Page {page} of {totalPages}</span><button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Next page"><ChevronRight size={17} /></button></div>
          </div>
        )}
      </article>

      {selectedCheckin && <VisitorDetails checkin={selectedCheckin} onClose={() => setSelectedCheckin(null)} />}
    </section>
  )
}

export default Palcechecikns
