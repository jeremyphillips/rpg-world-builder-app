'use client'

import { cn } from '../../lib/utils'
import { Text } from './text'
import { useFieldDerivedMetaContext } from './field-derived-meta-context.client'
import {
  fieldDerivedMetaLabelVariants,
  fieldDerivedMetaRegionVariants,
  fieldDerivedMetaRowVariants,
  fieldDerivedMetaValueVariants,
} from './field-derived-meta.variants'

export interface FieldDerivedMetaProps {
  /** When set, applied to the metadata region when rows are present. */
  id?: string
  className?: string
}

/** Renders derived metadata rows below the control band. Reads from `FieldDerivedMetaProvider`. */
export function FieldDerivedMeta({ id, className }: FieldDerivedMetaProps) {
  const { meta, reserveSpace } = useFieldDerivedMetaContext()
  const rows = meta?.rows ?? []
  const hasRows = rows.length > 0

  if (!hasRows && !reserveSpace) return null

  return (
    <div
      id={hasRows ? id : undefined}
      className={cn(fieldDerivedMetaRegionVariants({ reserveSpace }), className)}
      aria-hidden={!hasRows || undefined}
    >
      {rows.map((row) => (
        <div key={row.label} className={fieldDerivedMetaRowVariants()}>
          <Text variant="caption" as="span" className={fieldDerivedMetaLabelVariants()}>
            {row.label}
          </Text>
          <Text variant="caption" as="span" className={fieldDerivedMetaValueVariants()}>
            {row.value}
          </Text>
        </div>
      ))}
    </div>
  )
}
