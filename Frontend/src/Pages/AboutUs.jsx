import { ArrowRight, BarChart3, Building2, HeartHandshake, QrCode, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

const values = [
  {
    icon: BarChart3,
    title: 'Useful crowd insights',
    description: 'We turn check-in activity into clear daily and hourly information that helps visitors plan ahead.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy with purpose',
    description: 'Crowd trends are designed to be useful without displaying personal visitor details publicly.',
  },
  {
    icon: HeartHandshake,
    title: 'Better shared spaces',
    description: 'Visitors and palace teams get the information they need to create smoother, more comfortable visits.',
  },
]

const steps = [
  { icon: Building2, label: 'Discover', text: 'Explore approved palaces and understand their recent crowd patterns.' },
  { icon: QrCode, label: 'Check in', text: 'Use a palace QR code to record entry and checkout securely.' },
  { icon: Users, label: 'Share', text: 'Review completed visits and help the next visitor make a better decision.' },
]

function AboutUs() {
  return (
    <main className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <section className="relative isolate overflow-hidden bg-slate-950 px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.28),transparent_28%),radial-gradient(circle_at_85%_65%,rgba(6,182,212,0.2),transparent_30%)]" />
        <div className="mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            <Sparkles size={14} aria-hidden="true" /> About CrowdSight
          </span>
          <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Know the crowd before you arrive.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            CrowdSight helps people choose calmer times to visit while giving palace teams a clearer view of visitor activity.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-500">
              Explore palaces <ArrowRight size={17} />
            </Link>
            <Link to="/contactus" className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">
              Contact our team
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Our mission</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Make busy places easier to understand.</h2>
              <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300">
                Visiting a popular place should not begin with uncertainty. We combine QR check-ins, historical patterns, and visitor feedback so people can make informed decisions before leaving home.
              </p>
              <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
                For palace teams, CrowdSight brings daily operations, crowd trends, recent check-ins, and reviews into one focused workspace.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {values.map(({ icon: Icon, title, description }) => (
                <article key={title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:flex lg:items-start lg:gap-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    <Icon size={21} aria-hidden="true" />
                  </span>
                  <div className="mt-4 lg:mt-0">
                    <h3 className="font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-4 py-16 dark:border-slate-800 dark:bg-slate-900/60 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">How it works</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">A simple visit from start to finish</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map(({ icon: Icon, label, text }, index) => (
              <article key={label} className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <span className="absolute right-5 top-4 text-5xl font-black text-slate-100 dark:text-slate-800">0{index + 1}</span>
                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-600/20">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h3 className="relative mt-5 text-lg font-bold">{label}</h3>
                <p className="relative mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 rounded-3xl bg-linear-to-r from-blue-700 to-cyan-600 px-6 py-10 text-center text-white shadow-xl shadow-blue-700/15 sm:px-10 lg:flex-row lg:text-left">
          <div>
            <h2 className="text-2xl font-black sm:text-3xl">Ready to plan a better visit?</h2>
            <p className="mt-2 text-sm text-blue-100">Explore crowd information and choose a time that works for you.</p>
          </div>
          <Link to="/" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50">
            View palaces <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  )
}

export default AboutUs
