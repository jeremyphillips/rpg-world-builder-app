'use client'

import * as React from 'react'

import type { RichTextTableEmbedHost } from './rich-text-table-embed.types'

const listeners = new Set<() => void>()
let activeHost: RichTextTableEmbedHost | null = null

export function registerRichTextTableEmbedHost(host: RichTextTableEmbedHost | null): void {
  activeHost = host
  listeners.forEach((listener) => listener())
}

export function getRichTextTableEmbedHost(): RichTextTableEmbedHost | null {
  return activeHost
}

export function useRichTextTableEmbedHost(): RichTextTableEmbedHost | null {
  const [, forceRender] = React.useReducer((count: number) => count + 1, 0)

  React.useEffect(() => {
    listeners.add(forceRender)
    return () => {
      listeners.delete(forceRender)
    }
  }, [])

  return activeHost
}

/** Registers a host for the lifetime of the component — used by dashboard spell authoring. */
export function RichTextTableEmbedHostRegistrar({
  host,
  children,
}: {
  host: RichTextTableEmbedHost
  children?: React.ReactNode
}) {
  React.useLayoutEffect(() => {
    registerRichTextTableEmbedHost(host)
    return () => registerRichTextTableEmbedHost(null)
  }, [host])

  return children ?? null
}
