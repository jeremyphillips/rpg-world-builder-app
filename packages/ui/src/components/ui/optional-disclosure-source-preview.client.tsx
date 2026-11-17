'use client'

import { Text } from './text'
import {
  fieldDerivedMetaLabelVariants,
  fieldDerivedMetaRowVariants,
  fieldDerivedMetaValueVariants,
} from './field-derived-meta.variants'

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
    <div id={id} className={fieldDerivedMetaRowVariants}>
      <Text variant="caption" as="span" className={fieldDerivedMetaLabelVariants}>
        {preview.label}
      </Text>
      <Text variant="caption" as="span" className={fieldDerivedMetaValueVariants}>
        {preview.text}
      </Text>
    </div>
  )
}
