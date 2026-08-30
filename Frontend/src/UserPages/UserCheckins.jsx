import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LoaderCircle,
  MapPin,
  MessageSquarePlus,
  Pencil,
  Star,
  Trash2,
} from 'lucide-react'
import ReviewModal from '../Components/ReviewModal'

const API_BASE_URL = import.meta.env.VITE_API_URL
const PAGE_SIZE = 8

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatDuration(start, end) {
  if (!start || !end) return 'Currently visiting'
  const totalMinutes = Math.max(0, Math.round((new Date(end) - new Date(start)) / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`
}

function UserCheckins() {
  const [checkins, setCheckins] = useState([])
  const [totalcount, setTotalcount] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('newest')
  const [fromdate, setFromdate] = useState('')
  const [todate, setTodate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [reviewTarget, setReviewTarget] = useState(null)
  const [deletingId, setDeletingId] = useState('')

  const loadCheckins = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}checkin/mine`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: PAGE_SIZE, status, sort, fromdate, todate },
      })
      setCheckins(response.data.result || [])
      setTotalcount(response.data.totalcount || 0)
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to load your check-ins.')
    } finally {
      setLoading(false)
    }
  }, [fromdate, page, sort, status, todate])

  useEffect(() => {
    Promise.resolve().then(loadCheckins)
  }, [loadCheckins])

  const resetPageAndSet = (setter) => (event) => {
    setPage(1)
    setter(event.target.value)
  }

  const openReview = (checkin) => {
    setReviewTarget({
      checkin: {
        checkinid: checkin._id,
        palaceid: checkin.palace?._id,
        palaceName: checkin.palace?.name,
      },
      review: checkin.review || null,
    })
  }

  const handleReviewSaved = async () => {
    setReviewTarget(null)
    setNotice('Your review was saved successfully.')
    await loadCheckins()
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review? This cannot be undone.')) return
    setDeletingId(reviewId)
    setError('')
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_BASE_URL}review/delete/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotice('Your review was deleted.')
      await loadCheckins()
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to delete your review.')
    } finally {
      setDeletingId('')
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalcount / PAGE_SIZE))

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Your activity</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">My check-ins</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">View your visits and manage reviews for completed check-ins.</p>
          </div>
          <div className="rounded-2xl bg-blue-600 px-5 py-3 text-white shadow-lg shadow-blue-600/15">
            <p className="text-xs font-medium text-blue-100">Total visits found</p>
            <p className="text-2xl font-bold">{totalcount}</p>
          </div>
        </div>

        <section className="mt-7 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Status
            <select value={status} onChange={resetPageAndSet(setStatus)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800">
              <option value="all">All visits</option>
              <option value="checkedin">Active</option>
              <option value="checkedout">Completed</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            From date
            <input type="date" value={fromdate} max={todate || undefined} onChange={resetPageAndSet(setFromdate)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800" />
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            To date
            <input type="date" value={todate} min={fromdate || undefined} onChange={resetPageAndSet(setTodate)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800" />
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Sort
            <select value={sort} onChange={resetPageAndSet(setSort)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
          <button type="button" onClick={() => { setPage(1); setStatus('all'); setSort('newest'); setFromdate(''); setTodate('') }} className="self-end rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            Clear filters
          </button>
        </section>

        {notice && (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice('')} className="font-semibold">Dismiss</button>
          </div>
        )}
        {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}

        {loading ? (
          <div className="flex min-h-72 items-center justify-center"><LoaderCircle size={34} className="animate-spin text-blue-600" aria-label="Loading check-ins" /></div>
        ) : checkins.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
            <CalendarDays size={42} className="mx-auto text-slate-300 dark:text-slate-600" />
            <h2 className="mt-4 font-bold text-slate-800 dark:text-white">No check-ins found</h2>
            <p className="mt-1 text-sm text-slate-500">Scan a palace QR code to record your first visit.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {checkins.map((checkin) => (
              <article key={checkin._id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="grid gap-5 p-5 lg:grid-cols-[1.15fr_1fr] lg:p-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-bold capitalize text-slate-900 dark:text-white">{checkin.palace?.name || 'Palace unavailable'}</h2>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${checkin.status === 'checkedin' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                        {checkin.status === 'checkedin' ? 'Currently checked in' : 'Completed'}
                      </span>
                    </div>
                    {checkin.palace?.address && <p className="mt-2 flex items-center gap-1.5 text-sm capitalize text-slate-500 dark:text-slate-400"><MapPin size={15} />{checkin.palace.address}</p>}
                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/70">
                        <span className="flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays size={14} />Checked in</span>
                        <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{formatDate(checkin.checkintime)}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/70">
                        <span className="flex items-center gap-1.5 text-xs text-slate-500"><Clock3 size={14} />{checkin.checkouttime ? 'Checked out' : 'Visit duration'}</span>
                        <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{checkin.checkouttime ? formatDate(checkin.checkouttime) : formatDuration(checkin.checkintime, checkin.checkouttime)}</p>
                        {checkin.checkouttime && <p className="mt-0.5 text-xs text-slate-500">Duration: {formatDuration(checkin.checkintime, checkin.checkouttime)}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                    {checkin.review ? (
                      <>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex gap-1" aria-label={`${checkin.review.rating} out of 5 stars`}>
                            {[1, 2, 3, 4, 5].map((value) => <Star key={value} size={18} className={value <= checkin.review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'} />)}
                          </div>
                          <div className="flex gap-1">
                            <button type="button" onClick={() => openReview(checkin)} className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-950/50" aria-label="Edit review"><Pencil size={17} /></button>
                            <button type="button" onClick={() => handleDeleteReview(checkin.review._id)} disabled={deletingId === checkin.review._id} className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-100 disabled:opacity-50 dark:text-rose-400 dark:hover:bg-rose-950/50" aria-label="Delete review">{deletingId === checkin.review._id ? <LoaderCircle size={17} className="animate-spin" /> : <Trash2 size={17} />}</button>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{checkin.review.description || 'No written comment.'}</p>
                      </>
                    ) : checkin.status === 'checkedout' ? (
                      <div className="flex h-full min-h-28 flex-col items-center justify-center text-center">
                        <MessageSquarePlus size={28} className="text-blue-500" />
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Share your experience from this visit.</p>
                        <button type="button" onClick={() => openReview(checkin)} className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">Write a review</button>
                      </div>
                    ) : (
                      <div className="flex h-full min-h-28 items-center justify-center text-center text-sm text-slate-500 dark:text-slate-400">You can leave a review after checking out.</div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <nav className="mt-7 flex items-center justify-center gap-3" aria-label="Check-in pages">
            <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} className="rounded-xl border border-slate-200 p-2 disabled:opacity-40 dark:border-slate-700"><ChevronLeft size={20} /></button>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Page {page} of {totalPages}</span>
            <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages} className="rounded-xl border border-slate-200 p-2 disabled:opacity-40 dark:border-slate-700"><ChevronRight size={20} /></button>
          </nav>
        )}
      </div>

      {reviewTarget && <ReviewModal checkin={reviewTarget.checkin} review={reviewTarget.review} onClose={() => setReviewTarget(null)} onSaved={handleReviewSaved} />}
    </main>
  )
}

export default UserCheckins
