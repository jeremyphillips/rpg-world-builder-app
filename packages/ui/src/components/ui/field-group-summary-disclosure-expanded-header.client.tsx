import { Button } from './button.client'
import type { FieldSize } from './field.client'
import {
  fieldGroupSummaryDisclosureActionButtonClasses,
  fieldGroupSummaryDisclosureHeaderClasses,
  resolveFieldGroupSummaryDisclosureExpandedLegendClassName,
} from './field-group-summary-disclosure.variants'
import { Text } from './text'

export type FieldGroupSummaryDisclosureExpandedHeaderProps = {
  legend: string
  legendId: string
  panelId: string
  size: FieldSize
  closeLabel: string
  disabled: boolean
  onClose: () => void
}

export function FieldGroupSummaryDisclosureExpandedHeader({
  legend,
  legendId,
  panelId,
  size,
  closeLabel,
  disabled,
  onClose,
}: FieldGroupSummaryDisclosureExpandedHeaderProps) {
  return (
    <div className={fieldGroupSummaryDisclosureHeaderClasses}>
      <Text
        id={legendId}
        className={resolveFieldGroupSummaryDisclosureExpandedLegendClassName(size)}
      >
        {legend}
      </Text>
      <Button
        type="button"
        variant="text"
        size="sm"
        className={fieldGroupSummaryDisclosureActionButtonClasses}
        aria-expanded
        aria-controls={panelId}
        disabled={disabled}
        onClick={onClose}
      >
        {closeLabel}
      </Button>
    </div>
  )
}
