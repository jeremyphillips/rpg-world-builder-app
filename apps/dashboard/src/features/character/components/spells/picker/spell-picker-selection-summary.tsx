import { Check } from 'lucide-react'

import { InlineMetadata, Text } from '@rpg/ui'

import { spellPickerSelectionSummaryClasses } from './spell-picker-selection-summary.variants'

export type SpellPickerSelectionSummaryProps = {
  complete?: boolean
  countText: string
  metadata?: string
}

function SelectionCount({ complete, countText }: { complete: boolean; countText: string }) {
  return (
    <span className={complete ? 'inline-flex items-center gap-1 text-success' : undefined}>
      {complete ? <Check aria-hidden className="size-icon-inline shrink-0" /> : null}
      <span>{countText}</span>
    </span>
  )
}

export function SpellPickerSelectionSummary({
  complete = false,
  countText,
  metadata,
}: SpellPickerSelectionSummaryProps) {
  return (
    <Text as="span" variant="muted" className={spellPickerSelectionSummaryClasses}>
      {metadata ? (
        <InlineMetadata role="supporting" density="compact">
          <InlineMetadata.Item>
            <SelectionCount complete={complete} countText={countText} />
          </InlineMetadata.Item>
          <InlineMetadata.Item>{metadata}</InlineMetadata.Item>
        </InlineMetadata>
      ) : (
        <SelectionCount complete={complete} countText={countText} />
      )}
    </Text>
  )
}
