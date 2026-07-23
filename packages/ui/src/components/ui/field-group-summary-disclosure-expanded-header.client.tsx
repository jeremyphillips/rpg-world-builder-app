import { Button } from './button.client'
import {
  fieldGroupSummaryDisclosureActionButtonClasses,
  fieldGroupSummaryDisclosureHeaderClasses,
} from './field-group-summary-disclosure.variants'
import { Text } from './text'

export type FieldGroupSummaryDisclosureExpandedHeaderProps = {
  legend: string
  legendId: string
  panelId: string
  closeLabel: string
  disabled: boolean
  onClose: () => void
}

export function FieldGroupSummaryDisclosureExpandedHeader({
  legend,
  legendId,
  panelId,
  closeLabel,
  disabled,
  onClose,
}: FieldGroupSummaryDisclosureExpandedHeaderProps) {
  return (
    <div className={fieldGroupSummaryDisclosureHeaderClasses}>
      <Text id={legendId} className="text-sm font-medium">
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
