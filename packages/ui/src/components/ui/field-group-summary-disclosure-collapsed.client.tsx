import type { FieldSize } from './field.client'
import type { FieldGroupSummary } from './field-group-disclosure.types'
import { FieldGroupSummaryTrigger } from './field-group-summary-trigger.client'
import { fieldGroupSummaryDisclosureLegendVariants } from './field-group-summary-disclosure.variants'
import { Text } from './text'

export type FieldGroupSummaryDisclosureCollapsedProps = {
  legend: string
  legendId: string
  panelId: string
  size: FieldSize
  summary: FieldGroupSummary
  openLabel: string
  unsavedSuffix: string
  showDirtySuffix: boolean
  disabled: boolean
  onOpen: () => void
}

export function FieldGroupSummaryDisclosureCollapsed({
  legend,
  legendId,
  panelId,
  size,
  summary,
  openLabel,
  unsavedSuffix,
  showDirtySuffix,
  disabled,
  onOpen,
}: FieldGroupSummaryDisclosureCollapsedProps) {
  return (
    <>
      <Text
        id={legendId}
        variant="muted"
        className={fieldGroupSummaryDisclosureLegendVariants({ size })}
      >
        {legend}
      </Text>
      <FieldGroupSummaryTrigger
        size={size}
        summary={summary}
        openLabel={openLabel}
        unsavedSuffix={unsavedSuffix}
        showDirtySuffix={showDirtySuffix}
        disabled={disabled}
        panelId={panelId}
        expanded={false}
        onOpen={onOpen}
      />
    </>
  )
}
