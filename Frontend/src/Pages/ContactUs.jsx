import { useState } from 'react'
import { Clock3, Mail, MapPin, MessageSquareText, Phone, Send } from 'lucide-react'

const contactCards = [
  { icon: Mail, label: 'Email us', value: 'support@crowdsight.com', href: 'mailto:support@crowdsight.com' },
  { icon: Phone, label: 'Call us', value: '+91 90000 00000', href: 'tel:+919000000000' },
  { icon: Clock3, label: 'Support hours', value: 'Mon–Sat, 9:00 AM–7:00 PM' },
]

function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [notice, setNotice] = useState('')

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setNotice('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const subject = encodeURIComponent(form.subject || 'CrowdSight enquiry')
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)
    setNotice('Your email application is opening with the message ready to send.')
    window.location.href = `mailto:support@crowdsight.com?subject=${subject}&body=${body}`
  }

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <section className="relative overflow-hidden bg-slate-950 px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(37,99,235,0.28),transparent_32%),radial-gradient(circle_at_90%_90%,rgba(6,182,212,0.18),transparent_28%)]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/20">
            <MessageSquareText size={24} aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">Let’s talk</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Have a question about CrowdSight, palace registration, check-ins, or your account? Send us a message and our team will help.
          </p>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-6xl gap-7 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-4">
            {contactCards.map(({ icon: Icon, label, value, href }) => {
              const content = (
                <>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</span>
                    <span className="mt-1 block text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</span>
                  </span>
                </>
              )

              return href ? (
                <a key={label} href={href} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700">
                  {content}
                </a>
              ) : (
                <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  {content}
                </div>
              )
            })}

            <div className="rounded-3xl bg-linear-to-br from-blue-700 to-cyan-600 p-6 text-white shadow-lg shadow-blue-700/15">
              <MapPin size={22} aria-hidden="true" />
              <h2 className="mt-4 text-lg font-bold">Serving visitors and palace teams</h2>
              <p className="mt-2 text-sm leading-6 text-blue-100">CrowdSight support is available across India for visitor, admin, and palace account questions.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Send a message</p>
              <h2 className="mt-2 text-2xl font-black">How can we help?</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Complete the form and it will open in your email application.</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Name
                  <input name="name" value={form.name} onChange={updateField} required autoComplete="name" placeholder="Your name" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </label>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Email
                  <input type="email" name="email" value={form.email} onChange={updateField} required autoComplete="email" placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </label>
              </div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Subject
                <input name="subject" value={form.subject} onChange={updateField} required placeholder="What do you need help with?" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </label>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Message
                <textarea name="message" value={form.message} onChange={updateField} required rows={6} maxLength={2000} placeholder="Tell us how we can help..." className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </label>

              {notice && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" role="status">{notice}</p>}

              <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-700 sm:w-auto">
                <Send size={17} aria-hidden="true" /> Send message
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}

export default ContactUs
