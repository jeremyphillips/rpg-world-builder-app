'use client'

import type { DataTableColumnVisibilityTriggerProps } from '@rpg/ui'

const COLUMNS_ARIA_LABEL = 'Choose visible columns'

export type CatalogTableUtilityStripProps = {
  resultCountLabel: string
  ColumnVisibilityTrigger: React.ComponentType<DataTableColumnVisibilityTriggerProps>
}

/** Tinted catalog overview strip — result count and column visibility only. */
export function CatalogTableUtilityStrip({
  resultCountLabel,
  ColumnVisibilityTrigger,
}: CatalogTableUtilityStripProps) {
  return (
    <div className="flex w-full items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">{resultCountLabel}</span>
      <ColumnVisibilityTrigger aria-label={COLUMNS_ARIA_LABEL} showLabel={false} />
    </div>
  )
}
