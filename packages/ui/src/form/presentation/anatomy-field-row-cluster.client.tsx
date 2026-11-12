'use client'

import { cn } from '../../lib/utils'
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
  return (
    <div
      className={cn(
        'row-span-3 grid min-w-0 w-full grid-rows-subgrid grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
        gap === 'compact' ? 'gap-x-4' : 'gap-x-6',
      )}
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
