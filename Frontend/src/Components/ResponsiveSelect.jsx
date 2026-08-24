import { useEffect, useRef, useState } from 'react'

function ResponsiveSelect({
  value,
  onChange,
  options,
  ariaLabel,
  className = '',
  disabled = false,
  invalid = false,
  comfortable = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const selectedOption = options.find((option) => option.value === value) || options[0]

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  return (
    <div ref={containerRef} className={`relative min-w-0 max-w-full ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={invalid}
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setIsOpen(false)
        }}
        className={`flex w-full min-w-0 items-center justify-between gap-2 rounded-xl border bg-slate-50/50 px-3.5 text-left text-sm font-medium text-slate-700 outline-none transition-all duration-200 focus:bg-white focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800/80 dark:text-slate-200 dark:focus:bg-slate-800 ${
          comfortable ? 'py-3.5' : 'py-2.5'
        } ${
          invalid
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10 dark:border-rose-500'
            : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10 dark:border-slate-700/80 dark:focus:ring-blue-500/20'
        }`}
      >
        <span className="min-w-0 flex-1 truncate">{selectedOption?.label}</span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path fillRule="evenodd" d="M5.22 7.22a.75.75 0 011.06 0L10 10.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 8.28a.75.75 0 010-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 right-0 z-40 mt-2 max-h-[min(15rem,calc(100dvh-8rem))] overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-800"
        >
          {options.map((option) => (
            <button
              type="button"
              role="option"
              aria-selected={option.value === value}
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`block w-full truncate rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                option.value === value
                  ? 'bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
              }`}
              title={option.label}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ResponsiveSelect
