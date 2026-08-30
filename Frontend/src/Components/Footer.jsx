import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import headerlogo from '../assets/headerlogo.svg'

const footerLinks = [
  { label: 'Explore Palaces', to: '/' },
  { label: 'About Us', to: '/aboutus' },
  { label: 'Contact Us', to: '/contactus' },
  { label: 'Help & Support', to: '/helpandsupport' },
]

function Footer() {
  const { pathname } = useLocation()
  const dashboardRoutes = ['/admin', '/superadmin', '/palace']
  const isDashboard = dashboardRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )

  if (isDashboard) return null

  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-white text-slate-600 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
      <div className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-blue-400/15 blur-3xl dark:bg-blue-600/15" />
      <div className="pointer-events-none absolute -bottom-48 -left-32 h-96 w-96 rounded-full bg-cyan-300/15 blur-3xl dark:bg-cyan-500/10" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1fr]">
          <div className="max-w-md">
            <Link to="/" className="inline-flex items-center gap-2.5" aria-label="CrowdSight home">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-lg shadow-blue-200/60 dark:border-0 dark:shadow-blue-950/40">
                <img src={headerlogo} alt="" className="h-8 w-auto" />
              </span>
              <span className="text-xl font-black tracking-tight text-blue-600 dark:text-blue-400">
                Crowd<span className="text-slate-900 dark:text-white">Sight</span>
              </span>
            </Link>
            <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-400">
              Make every visit easier with live crowd insights, check-in history, visitor reviews,
              and simple QR-based entry and exit.
            </p>
            <Link
              to="/aboutus"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Learn about CrowdSight <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-900 dark:text-white">Quick links</h2>
            <nav className="mt-5 grid gap-3" aria-label="Footer navigation">
              {footerLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="w-fit text-sm text-slate-600 transition hover:translate-x-1 hover:text-blue-700 dark:text-slate-400 dark:hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-900 dark:text-white">Get in touch</h2>
            <div className="mt-5 space-y-4 text-sm">
              <a href="mailto:support@crowdsight.com" className="flex items-start gap-3 transition hover:text-blue-700 dark:hover:text-white">
                <Mail size={17} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <span>support@crowdsight.com</span>
              </a>
              <a href="tel:+919000000000" className="flex items-start gap-3 transition hover:text-blue-700 dark:hover:text-white">
                <Phone size={17} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <span>+91 90000 00000</span>
              </a>
              <p className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                <MapPin size={17} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <span>India</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CrowdSight. All rights reserved.</p>
          <p>Plan smarter. Visit comfortably.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
