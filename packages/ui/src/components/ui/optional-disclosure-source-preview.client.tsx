'use client'

import { OptionalDisclosureInheritedLine } from './optional-disclosure-inherited-line.client'

export type OptionalDisclosureSourcePreviewContent = {
  label: string
  text: string
}

/** Subordinate inherited source shown above an open optional override editor. */
export function OptionalDisclosureSourcePreview({
  id,
  preview,
}: {
  id?: string
  preview?: OptionalDisclosureSourcePreviewContent
}) {
  if (!preview) return null

  return (
    <OptionalDisclosureInheritedLine
      id={id}
      leading={preview.label}
      value={preview.text}
      formatSourceLeading
    />
  )
}
