'use client'

import { useEffect, useState } from 'react'

import { FORM_COLUMNS_WIDE_MEDIA_QUERY } from '../form/containers/form-columns.variants'

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

export const VIEWPORT_MD_MIN_QUERY = FORM_COLUMNS_WIDE_MEDIA_QUERY
