import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Resets document scroll on pathname change (query/hash changes preserve scroll). */
export function usePathnameScrollReset() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
}
