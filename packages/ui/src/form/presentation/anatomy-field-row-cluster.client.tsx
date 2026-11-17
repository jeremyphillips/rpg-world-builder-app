'use client'

import type { CSSProperties } from 'react'

import { resolveFieldRowColumnTracks } from '../../components/ui/field-row-column-tracks.lib'
import { cn } from '../../lib/utils'
import { resolveRowFieldWidths } from '../config/resolve-row-field-widths.lib'
import { FieldNode } from '../containers/form-conditional.client'
import { isRowSlotItem, resolveFieldConfigPrimaryName, type RowFieldItem } from '../field-config'

export type AnatomyFieldRowClusterProps = {
  idPrefix: string
  namePrefix?: string
  fields: readonly RowFieldItem[]
  /** Matches compact schema row gap-x (`compact` → 16px). */
  gap?: 'form' | 'compact'
}

/**
 * Two-up field cluster for a parent anatomy row slot (`2/3` track). Participates
 * in the parent subgrid so sibling columns (e.g. Melee reach) share label/control/
 * message tracks with the clustered fields.
 */
export function AnatomyFieldRowCluster({
  idPrefix,
  namePrefix,
  fields,
  gap = 'compact',
}: AnatomyFieldRowClusterProps) {
  const leafFields = fields.filter((field) => !isRowSlotItem(field))
  const { gridTemplateColumns } = resolveFieldRowColumnTracks(resolveRowFieldWidths(leafFields))

  return (
    <div
      className={cn(
        'row-span-3 grid min-w-0 w-full grid-rows-subgrid [grid-template-columns:var(--row-cols)]',
        gap === 'compact' ? 'gap-x-4' : 'gap-x-6',
      )}
      style={{ '--row-cols': gridTemplateColumns } as CSSProperties}
    >
      {fields.map((field) => {
        if (isRowSlotItem(field)) return null
        const fieldKey = namePrefix
          ? `${namePrefix}.${resolveFieldConfigPrimaryName(field)}`
          : resolveFieldConfigPrimaryName(field)
        return (
          <FieldNode key={fieldKey} config={field} idPrefix={idPrefix} namePrefix={namePrefix} />
        )
      })}
    </div>
  )
}
