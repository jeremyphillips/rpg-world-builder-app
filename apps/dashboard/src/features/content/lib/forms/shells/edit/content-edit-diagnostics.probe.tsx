import type { ReactNode } from 'react'

/** Minimal edit layout for diagnostic alert tests — surfaces header notices and save affordance. */
export function DiagnosticsEditProbeLayout({
  formHeaderPrefix,
  submitLabel = 'Save changes',
}: {
  formHeaderPrefix?: ReactNode
  submitLabel?: string
}) {
  return (
    <div>
      {formHeaderPrefix}
      <button type="submit">{submitLabel}</button>
    </div>
  )
}
