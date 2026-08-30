import { useEffect, useState } from 'react'
import axios from 'axios'
import { LoaderCircle, MessageSquareText, Star, X } from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_URL

function ReviewModal({ checkin, review = null, onClose, onSaved }) {
  const [rating, setRating] = useState(review?.rating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [description, setDescription] = useState(review?.description || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !submitting) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, submitting])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!rating) {
      setError('Please select a rating.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const payload = { rating, description }
      const response = review?._id
        ? await axios.patch(`${API_BASE_URL}review/update/${review._id}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : await axios.post(
            `${API_BASE_URL}review/create`,
            { ...payload, checkinid: checkin.checkinid },
            { headers: { Authorization: `Bearer ${token}` } },
          )

      onSaved(response.data.review)
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to save your review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div className="flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <MessageSquareText size={22} aria-hidden="true" />
            </span>
            <div>
              <h2 id="review-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                {review ? 'Update your review' : 'How was your visit?'}
              </h2>
              <p className="mt-0.5 text-sm capitalize text-slate-500 dark:text-slate-400">
                {checkin.palaceName || 'Palace visit'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close review form"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <fieldset>
            <legend className="text-sm font-semibold text-slate-700 dark:text-slate-200">Your rating</legend>
            <div className="mt-3 flex gap-2" onMouseLeave={() => setHoveredRating(0)}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setRating(value)
                    setError('')
                  }}
                  onMouseEnter={() => setHoveredRating(value)}
                  aria-label={`${value} star${value > 1 ? 's' : ''}`}
                  className="rounded-xl p-1 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <Star
                    size={32}
                    className={
                      value <= (hoveredRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 dark:text-slate-600'
                    }
                  />
                </button>
              ))}
            </div>
          </fieldset>

          <label htmlFor="review-description" className="mt-6 block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Tell us about your experience <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            id="review-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="What did you like? Was it crowded?"
            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <div className="mt-1 text-right text-xs text-slate-400">{description.length}/2000</div>

          {error && (
            <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" role="alert">
              {error}
            </p>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {review ? 'Cancel' : 'Maybe later'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <LoaderCircle size={17} className="animate-spin" />}
              {review ? 'Save changes' : 'Submit review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReviewModal
