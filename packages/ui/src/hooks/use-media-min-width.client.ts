'use client'

import { useEffect, useState } from 'react'

/** Compiled viewport `md`: `@media (width >= 48rem)`. */
export const VIEWPORT_MD_MIN_QUERY = '(width >= 48rem)'

export function useMediaMinWidth(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false
    }
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined

    const media = window.matchMedia(query)
    const onChange = () => setMatches(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [query])

  return matches
}
