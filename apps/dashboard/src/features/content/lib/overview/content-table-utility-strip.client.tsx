'use client'

import { Button, type DataTableColumnVisibilityTriggerProps } from '@rpg/ui'

export type ContentTableUtilityStripProps = {
  resultCountLabel: string
  canManage: boolean
  ColumnVisibilityTrigger: React.ComponentType<DataTableColumnVisibilityTriggerProps>
}

const COLUMNS_ARIA_LABEL = 'Choose visible columns'

/** Tinted overview strip — result count left, Select + columns right. */
export function ContentTableUtilityStrip({
  resultCountLabel,
  canManage,
  ColumnVisibilityTrigger,
}: ContentTableUtilityStripProps) {
  return (
    <div className="flex w-full items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">{resultCountLabel}</span>
      <div className="flex items-center gap-1">
        {canManage ? (
          <Button type="button" variant="ghost" size="sm" disabled aria-pressed={false}>
            Select
          </Button>
        ) : null}
        <ColumnVisibilityTrigger aria-label={COLUMNS_ARIA_LABEL} showLabel={false} />
      </div>
    </div>
  )
}
