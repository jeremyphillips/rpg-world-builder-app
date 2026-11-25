'use client'

import type { ReactNode } from 'react'

/** Row-scoped spill wrapper — pairs with field-row-anatomy.utilities.css. */
export function FieldIntrinsicSpill({ children }: { children: ReactNode }) {
  return <div data-field-intrinsic-spill="">{children}</div>
}

/** Visible label cluster that may contribute to auto column width. */
export function FieldIntrinsicSizing({ children }: { children: ReactNode }) {
  return <div data-field-intrinsic-sizing="">{children}</div>
}
