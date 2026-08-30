import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  MessageSquareText,
  RefreshCw,
  Search,
  Star,
} from 'lucide-react'
import useDebouncing from '../Hooks/UseDebouncing'

const API_BASE_URL = import.meta.env.VITE_API_URL
const emptyRatingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

function formatReviewDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'
  return date.toLocaleDateString([], { day: '2-digit', month: 'long', year: 'numeric' })
}

function getId(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return String(value._id || value.id || '')
}

function RatingStars({ rating, size = 16 }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} size={size} className={index < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-300 dark:fill-slate-800 dark:text-slate-600'} aria-hidden="true" />
      ))}
    </span>
  )
}

function ReviewSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800" /><div className="mt-4 h-3 w-32 rounded bg-slate-100 dark:bg-slate-800" /><div className="mt-3 h-3 w-full rounded bg-slate-100 dark:bg-slate-800" /><div className="mt-2 h-3 w-3/4 rounded bg-slate-100 dark:bg-slate-800" /></div>
      ))}
    </div>
  )
}

function PalaceReviews() {
  const [reviews, setReviews] = useState([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncing(search.trim(), 500)
  const [rating, setRating] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [summary, setSummary] = useState({ total: 0, average: 0, counts: emptyRatingCounts })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const limit = 6

  const fetchReviews = useCallback(async (signal, isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}review/getall`, {
        signal,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        params: { search: debouncedSearch, rating, sort, page, limit },
      })
      const data = response?.data || {}
      setReviews(data.result || [])
      setTotal(data.totalcount || 0)
      setSummary({
        total: data.totalReviews ?? data.totalcount ?? 0,
        average: Number(data.averageRating || 0),
        counts: data.ratingCounts || emptyRatingCounts,
      })
    } catch (requestError) {
      if (requestError?.code !== 'ERR_CANCELED') {
        setReviews([])
        setTotal(0)
        setError(requestError?.response?.data?.message || 'Unable to load palace reviews.')
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [debouncedSearch, page, rating, sort])

  useEffect(() => {
    const controller = new AbortController()
    Promise.resolve().then(() => fetchReviews(controller.signal))
    return () => controller.abort()
  }, [fetchReviews])

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const positiveReviews = (summary.counts[4] || 0) + (summary.counts[5] || 0)
  const positivePercent = summary.total ? Math.round((positiveReviews / summary.total) * 100) : 0

  const selectRating = (value) => {
    setRating(value)
    setPage(1)
  }

  return (
    <section className="space-y-5 pb-6">
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-violet-800 via-purple-800 to-fuchsia-900 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-fuchsia-300/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-200">Guest feedback</p><h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Palace reviews</h2><p className="mt-2 text-sm text-violet-100/80">See what visitors are saying about their experience.</p></div>
          <button type="button" onClick={() => fetchReviews(undefined, true)} disabled={refreshing} className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold transition hover:bg-white/20 disabled:cursor-wait disabled:opacity-70"><RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />{refreshing ? 'Refreshing...' : 'Refresh'}</button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Average rating</p><div className="mt-3 flex items-end gap-3"><p className="text-4xl font-black text-slate-900 dark:text-white">{summary.average.toFixed(1)}</p><div className="pb-1"><RatingStars rating={summary.average} /><p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">out of 5</p></div></div></article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Total reviews</p><div className="mt-3 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><MessageSquareText size={21} /></span><p className="text-4xl font-black text-slate-900 dark:text-white">{summary.total}</p></div></article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Positive reviews</p><div className="mt-3 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Star size={21} className="fill-current" /></span><div><p className="text-3xl font-black text-slate-900 dark:text-white">{positivePercent}%</p><p className="text-[11px] text-slate-500 dark:text-slate-400">4 and 5 star ratings</p></div></div></article>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(12rem,1fr)_auto]">
          <label className="relative"><span className="sr-only">Search reviews</span><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search guest name or review" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-violet-950" /></label>
          <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1) }} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-violet-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="highest">Highest rating</option><option value="lowest">Lowest rating</option></select>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => selectRating('')} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${rating === '' ? 'bg-violet-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}>All ({summary.total})</button>
          {[5, 4, 3, 2, 1].map((value) => <button key={value} type="button" onClick={() => selectRating(String(value))} className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition ${rating === String(value) ? 'bg-violet-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}><Star size={12} className="fill-amber-400 text-amber-400" />{value} ({summary.counts[value] || 0})</button>)}
        </div>
      </div>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</div>}

      {loading ? <ReviewSkeleton /> : reviews.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 text-center dark:border-slate-700 dark:bg-slate-900"><MessageSquareText size={42} className="text-slate-300 dark:text-slate-700" /><h3 className="mt-4 font-bold text-slate-800 dark:text-slate-100">No reviews found</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try changing the search or rating filter.</p></div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {reviews.map((review) => (
            <article key={getId(review)} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet-600 to-fuchsia-600 text-sm font-black uppercase text-white">{review.userid?.name?.charAt(0) || 'G'}</div><div className="min-w-0"><h3 className="truncate text-sm font-bold capitalize text-slate-900 dark:text-white">{review.userid?.name || 'Guest'}</h3><p className="mt-0.5 text-[11px] text-slate-400">{formatReviewDate(review.createdAt)}</p></div></div>
                <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">{review.rating}.0</span>
              </div>
              <div className="mt-4"><RatingStars rating={review.rating} /></div>
              <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600 dark:text-slate-300">{review.description || 'No written feedback was provided.'}</p>
            </article>
          ))}
        </div>
      )}

      {!loading && total > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-slate-500 dark:text-slate-400">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} matching reviews</p><div className="flex items-center gap-2"><button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Previous page"><ChevronLeft size={17} /></button><span className="min-w-20 text-center text-xs font-bold text-slate-700 dark:text-slate-300">Page {page} of {totalPages}</span><button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Next page"><ChevronRight size={17} /></button></div></div>
      )}
    </section>
  )
}

export default PalaceReviews
