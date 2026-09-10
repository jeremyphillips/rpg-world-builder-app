import type { FieldSize } from './field.client'
import type { FieldGroupSummary } from './field-group-disclosure.types'
import { FieldGroupSummaryTrigger } from './field-group-summary-trigger.client'
import { fieldLabelVariants } from './field.variants'

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
      <span id={legendId} className={fieldLabelVariants({ size })}>
        {legend}
      </span>
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
