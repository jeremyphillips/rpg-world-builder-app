'use client'

import { FieldMessageRegion } from './field-anatomy-regions'
import type { FieldSize } from './field.client'
import { FieldDerivedMeta } from './field-derived-meta.client'
import { useFieldDerivedMetaContext } from './field-derived-meta-context.client'

/** Derived metadata slot for fieldset shells that do not use `FieldLayout`. */
export function FieldsetDerivedMetaRegion({ id, size = 'md' }: { id: string; size?: FieldSize }) {
  const { meta, reserveSpace } = useFieldDerivedMetaContext()
  if (!meta?.rows.length && !reserveSpace) return null

  return (
    <FieldMessageRegion size={size}>
      <FieldDerivedMeta id={`${id}-derived-meta`} />
    </FieldMessageRegion>
  )
}
