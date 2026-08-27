import axios from 'axios'
import { useEffect, useState } from 'react'
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ResponsiveSelect from '../Components/ResponsiveSelect'
import useDebouncing from '../Hooks/UseDebouncing'

const API_BASE_URL = import.meta.env.VITE_API_URL
const PALACES_PER_PAGE = 12
const LOCATION_LIMIT = 500

function PalaceImage({ palace }) {
  const [imageFailed, setImageFailed] = useState(false)
  const imageUrl = palace.images?.[0]?.image

  if (!imageUrl || imageFailed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-blue-100 via-sky-50 to-indigo-100 text-blue-600 dark:from-blue-950 dark:via-slate-900 dark:to-indigo-950 dark:text-blue-400">
        <Building2 size={48} strokeWidth={1.5} aria-hidden="true" />
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={`${palace.name || 'Palace'} view`}
      loading="lazy"
      onError={() => setImageFailed(true)}
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  )
}

function UserHome() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncing(searchInput.trim(), 450)
  const [stateFilter, setStateFilter] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [areaFilter, setAreaFilter] = useState('')

  const [statesList, setStatesList] = useState([])
  const [citiesList, setCitiesList] = useState([])
  const [areasList, setAreasList] = useState([])
  const [statesLoading, setStatesLoading] = useState(true)
  const [citiesLoading, setCitiesLoading] = useState(false)
  const [areasLoading, setAreasLoading] = useState(false)
  const [filterError, setFilterError] = useState('')

  const [palaces, setPalaces] = useState([])
  const [totalPalaces, setTotalPalaces] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [palaceError, setPalaceError] = useState('')
  const [loadedQueryKey, setLoadedQueryKey] = useState('')

  const queryKey = [debouncedSearch, stateFilter, cityFilter, areaFilter, currentPage].join('|')
  const isDebouncing = searchInput.trim() !== debouncedSearch
  const isPalacesLoading = isDebouncing || loadedQueryKey !== queryKey
  const totalPages = Math.max(1, Math.ceil(totalPalaces / PALACES_PER_PAGE))
  const hasFilters = Boolean(searchInput || stateFilter || cityFilter || areaFilter)
  const firstResult = totalPalaces === 0 ? 0 : (currentPage - 1) * PALACES_PER_PAGE + 1
  const lastResult = Math.min(currentPage * PALACES_PER_PAGE, totalPalaces)

  useEffect(() => {
    const controller = new AbortController()

    axios
      .get(`${API_BASE_URL}location/getallstate`, {
        params: { activestatus: true, sort: 'az', page: 1, limit: LOCATION_LIMIT },
        signal: controller.signal,
      })
      .then((response) => {
        setStatesList(response?.data?.result || [])
        setFilterError('')
      })
      .catch((error) => {
        if (error.code !== 'ERR_CANCELED') {
          setFilterError('Unable to load location filters. Please try again.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setStatesLoading(false)
      })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!stateFilter) return undefined

    const controller = new AbortController()

    axios
      .get(`${API_BASE_URL}location/getallcity`, {
        params: {
          statesort: stateFilter,
          activestatus: true,
          sort: 'az',
          page: 1,
          limit: LOCATION_LIMIT,
        },
        signal: controller.signal,
      })
      .then((response) => {
        setCitiesList(response?.data?.result || [])
        setFilterError('')
      })
      .catch((error) => {
        if (error.code !== 'ERR_CANCELED') {
          setCitiesList([])
          setFilterError('Unable to load cities. Please try again.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCitiesLoading(false)
      })

    return () => controller.abort()
  }, [stateFilter])

  useEffect(() => {
    if (!cityFilter) return undefined

    const controller = new AbortController()

    axios
      .get(`${API_BASE_URL}location/getallarea`, {
        params: {
          citysort: cityFilter,
          activestatus: true,
          sort: 'asc',
          page: 1,
          limit: LOCATION_LIMIT,
        },
        signal: controller.signal,
      })
      .then((response) => {
        setAreasList(response?.data?.result || [])
        setFilterError('')
      })
      .catch((error) => {
        if (error.code !== 'ERR_CANCELED') {
          setAreasList([])
          setFilterError('Unable to load areas. Please try again.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setAreasLoading(false)
      })

    return () => controller.abort()
  }, [cityFilter])

  useEffect(() => {
    const controller = new AbortController()
    const requestQueryKey = queryKey

    axios
      .get(`${API_BASE_URL}palace/getallpalaces`, {
        params: {
          search: debouncedSearch,
          activestatus: true,
          approvestatus: 'approved',
          statesort: stateFilter,
          citysort: cityFilter,
          areasort: areaFilter,
          sort: 'newest',
          page: currentPage,
          limit: PALACES_PER_PAGE,
        },
        signal: controller.signal,
      })
      .then((response) => {
        const palaceResults = response?.data?.response || []
        setPalaces(palaceResults)
        setTotalPalaces(response?.data?.totalcount ?? palaceResults.length)
        setPalaceError('')
        setLoadedQueryKey(requestQueryKey)
      })
      .catch((error) => {
        if (error.code !== 'ERR_CANCELED') {
          setPalaces([])
          setTotalPalaces(0)
          setPalaceError(
            error?.response?.data?.message || 'Unable to load palaces. Please try again.',
          )
          setLoadedQueryKey(requestQueryKey)
        }
      })

    return () => controller.abort()
  }, [areaFilter, cityFilter, currentPage, debouncedSearch, queryKey, stateFilter])

  const handleStateChange = (value) => {
    setStateFilter(value)
    setCityFilter('')
    setAreaFilter('')
    setCitiesList([])
    setAreasList([])
    setCitiesLoading(Boolean(value))
    setAreasLoading(false)
    setCurrentPage(1)
    setPalaceError('')
  }

  const handleCityChange = (value) => {
    setCityFilter(value)
    setAreaFilter('')
    setAreasList([])
    setAreasLoading(Boolean(value))
    setCurrentPage(1)
    setPalaceError('')
  }

  const handleAreaChange = (value) => {
    setAreaFilter(value)
    setCurrentPage(1)
    setPalaceError('')
  }

  const handleSearchChange = (event) => {
    setSearchInput(event.target.value)
    setCurrentPage(1)
    setPalaceError('')
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    setPalaceError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetFilters = () => {
    setSearchInput('')
    setStateFilter('')
    setCityFilter('')
    setAreaFilter('')
    setCitiesList([])
    setAreasList([])
    setCitiesLoading(false)
    setAreasLoading(false)
    setCurrentPage(1)
    setFilterError('')
    setPalaceError('')
  }

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <section className="border-b border-blue-100 bg-linear-to-br from-blue-700 via-blue-600 to-indigo-700 px-4 py-12 text-white dark:border-slate-800 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-50 backdrop-blur-sm">
            <Building2 size={14} aria-hidden="true" />
            Discover nearby palaces
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Find the right palace for your next celebration
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
            Browse approved palaces and narrow the results by name, state, city, or area.
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-7 max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <SlidersHorizontal size={18} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
            Search and filter palaces
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="relative block sm:col-span-2 lg:col-span-1">
              <span className="sr-only">Search palace by name</span>
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Search palace by name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
              />
            </label>

            <ResponsiveSelect
              value={stateFilter}
              onChange={handleStateChange}
              ariaLabel="Filter palaces by state"
              disabled={statesLoading}
              options={[
                { value: '', label: statesLoading ? 'Loading states...' : 'All States' },
                ...statesList.map((state) => ({
                  value: state._id,
                  label: state.statename || state.name || 'Unnamed state',
                })),
              ]}
            />

            <ResponsiveSelect
              value={cityFilter}
              onChange={handleCityChange}
              ariaLabel="Filter palaces by city"
              disabled={!stateFilter || citiesLoading}
              options={[
                {
                  value: '',
                  label: citiesLoading ? 'Loading cities...' : stateFilter ? 'All Cities' : 'Select a state first',
                },
                ...citiesList.map((city) => ({
                  value: city._id,
                  label: city.cityname || city.name || 'Unnamed city',
                })),
              ]}
            />

            <ResponsiveSelect
              value={areaFilter}
              onChange={handleAreaChange}
              ariaLabel="Filter palaces by area"
              disabled={!cityFilter || areasLoading}
              options={[
                {
                  value: '',
                  label: areasLoading ? 'Loading areas...' : cityFilter ? 'All Areas' : 'Select a city first',
                },
                ...areasList.map((area) => ({
                  value: area._id,
                  label: area.areaname || area.name || 'Unnamed area',
                })),
              ]}
            />
          </div>

          <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
              {isPalacesLoading
                ? 'Finding palaces...'
                : `${totalPalaces} ${totalPalaces === 1 ? 'palace' : 'palaces'} found`}
            </p>

            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasFilters}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white sm:self-auto"
            >
              <RotateCcw size={16} aria-hidden="true" />
              Reset filters
            </button>
          </div>

          {filterError && (
            <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300" role="alert">
              {filterError}
            </p>
          )}
        </div>

        <div className="mt-8" aria-busy={isPalacesLoading}>
          {isPalacesLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                  aria-hidden="true"
                >
                  <div className="h-52 animate-pulse bg-slate-200 dark:bg-slate-800" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  </div>
                </div>
              ))}
            </div>
          ) : palaceError ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-12 text-center dark:border-rose-900/60 dark:bg-rose-950/30" role="alert">
              <h2 className="font-semibold text-rose-900 dark:text-rose-200">We could not load the palaces</h2>
              <p className="mt-2 text-sm text-rose-700 dark:text-rose-300">{palaceError}</p>
            </div>
          ) : palaces.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
              <Building2 size={42} className="mx-auto text-slate-400" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No palaces found</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Try changing your search or location filters.
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  View all palaces
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {palaces.map((palace) => {
                const stateName = palace.areaid?.cityid?.stateid?.statename
                const cityName = palace.areaid?.cityid?.cityname
                const areaName = palace.areaid?.areaname
                const location = [areaName, cityName, stateName].filter(Boolean).join(', ')

                return (
                  <article
                    key={palace._id}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800"
                  >
                    <div className="h-52 overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <PalaceImage palace={palace} />
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="min-w-0 truncate text-lg font-bold capitalize text-slate-900 dark:text-white">
                          {palace.name || 'Unnamed palace'}
                        </h2>
                        <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                          Available
                        </span>
                      </div>

                      <p className="mt-3 flex min-h-10 items-start gap-2 text-sm leading-5 text-slate-500 dark:text-slate-400">
                        <MapPin size={17} className="mt-0.5 shrink-0 text-blue-500" aria-hidden="true" />
                        <span className="capitalize">{location || palace.address || 'Location not available'}</span>
                      </p>

                      <p className="mt-4 line-clamp-3 min-h-15 text-sm leading-5 text-slate-600 dark:text-slate-300">
                        {palace.description || 'A palace ready to host your next memorable celebration.'}
                      </p>

                      {palace.address && (
                        <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                          <p className="line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Address:</span>{' '}
                            <span className="capitalize">{palace.address}</span>
                          </p>
                        </div>
                      )}

                      <div className="mt-auto pt-5">
                        <button
                          type="button"
                          onClick={() => navigate(`/palaces/${palace._id}`)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                        >
                          <Eye size={17} aria-hidden="true" />
                          View Palace
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>

        {!isPalacesLoading && !palaceError && totalPalaces > 0 && (
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{firstResult}–{lastResult}</span> of{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">{totalPalaces}</span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <ChevronLeft size={17} aria-hidden="true" />
                Previous
              </button>

              <span className="px-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Next
                <ChevronRight size={17} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

export default UserHome
