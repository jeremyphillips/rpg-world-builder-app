'use client'

import { Check } from 'lucide-react'

import { Text } from '@rpg/ui'

import { catalogPickerSelectionSummaryClasses } from './catalog-picker-selection-summary.variants'

export type CatalogPickerSelectionSummaryProps = {
  complete?: boolean
  countText: string
  metadata?: string
}

export function CatalogPickerSelectionSummary({
  complete = false,
  countText,
  metadata,
}: CatalogPickerSelectionSummaryProps) {
  return (
    <Text as="span" variant="muted" className={catalogPickerSelectionSummaryClasses}>
      <span className={complete ? 'inline-flex items-center gap-1 text-success' : undefined}>
        {complete ? <Check aria-hidden className="size-3.5 shrink-0" /> : null}
        <span>{countText}</span>
      </span>
      {metadata ? (
        <>
          <span aria-hidden> · </span>
          <span>{metadata}</span>
        </>
      ) : null}
    </Text>
  )
}
