import { useEffect, useState } from 'react'

function useDebouncing(value, time) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedValue(value)
    }, time)

    return () => clearTimeout(timerId)
  }, [time, value])

  return debouncedValue
}

export default useDebouncing
