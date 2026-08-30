import { ArrowLeft, Home, MapPinOff, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()

  return (
    <main className="relative isolate flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden bg-slate-50 px-4 py-16 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-600/15" />
      <div className="pointer-events-none absolute -right-24 top-12 -z-10 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-600/10" />

      <section className="w-full max-w-2xl text-center" aria-labelledby="not-found-title">
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-blue-200 bg-white text-blue-600 shadow-xl shadow-blue-200/40 dark:border-blue-900 dark:bg-slate-900 dark:text-blue-400 dark:shadow-blue-950/30">
          <MapPinOff size={43} aria-hidden="true" />
          <span className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
            <Search size={17} aria-hidden="true" />
          </span>
        </div>

        <p className="mt-8 bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-7xl font-black leading-none tracking-tighter text-transparent sm:text-8xl">
          404
        </p>
        <h1 id="not-found-title" className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
          This page wandered off
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
          The page you are looking for may have moved, been removed, or the address might be incorrect.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            <Home size={17} aria-hidden="true" />
            Return home
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={17} aria-hidden="true" />
            Go back
          </button>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-400 dark:border-slate-800">
          Need assistance?{' '}
          <Link to="/contactus" className="font-bold text-blue-600 hover:underline dark:text-blue-400">
            Contact support
          </Link>
        </div>
      </section>
    </main>
  )
}

export default NotFound
