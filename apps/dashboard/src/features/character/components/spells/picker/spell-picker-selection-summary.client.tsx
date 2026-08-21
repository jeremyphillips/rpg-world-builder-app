'use client'

import { Check } from 'lucide-react'

import { Text } from '@rpg/ui'

import { spellPickerSelectionSummaryClasses } from './spell-picker-selection-summary.variants'

export type SpellPickerSelectionSummaryProps = {
  complete?: boolean
  countText: string
  metadata?: string
}

export function SpellPickerSelectionSummary({
  complete = false,
  countText,
  metadata,
}: SpellPickerSelectionSummaryProps) {
  return (
    <Text as="span" variant="muted" className={spellPickerSelectionSummaryClasses}>
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
