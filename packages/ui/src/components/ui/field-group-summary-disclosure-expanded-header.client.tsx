import type { FieldSize } from './field.client'
import { resolveFieldGroupSummaryDisclosureExpandedLegendClassName } from './field-group-summary-disclosure.variants'
import { Text } from './text'

export type FieldGroupSummaryDisclosureExpandedHeaderProps = {
  legend: string
  legendId: string
  size: FieldSize
}

export function FieldGroupSummaryDisclosureExpandedHeader({
  legend,
  legendId,
  size,
}: FieldGroupSummaryDisclosureExpandedHeaderProps) {
  return (
    <Text id={legendId} className={resolveFieldGroupSummaryDisclosureExpandedLegendClassName(size)}>
      {legend}
    </Text>
  )
}
