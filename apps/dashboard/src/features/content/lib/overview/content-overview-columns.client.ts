'use client'

import { useRef } from 'react'

import type { ColumnDef } from '@rpg/ui'

import { createOverviewColumnDefsSignature } from './content-overview-columns.lib'

/**
 * Keeps a stable column-def reference when overview routes pass a freshly allocated
 * array each render (e.g. `classColumns(campaignId)` inline in JSX).
 */
export function useStableOverviewColumns<T>(
  columns: ColumnDef<T, unknown>[],
): ColumnDef<T, unknown>[] {
  const signature = createOverviewColumnDefsSignature(columns as ColumnDef<unknown>[])
  const stableColumnsRef = useRef(columns)
  const signatureRef = useRef(signature)

  if (signatureRef.current !== signature) {
    signatureRef.current = signature
    stableColumnsRef.current = columns
  }

  return stableColumnsRef.current
}
