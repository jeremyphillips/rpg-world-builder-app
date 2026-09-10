import type { FieldSize } from './field.client'
import { fieldLabelVariants } from './field.variants'

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
    <span id={legendId} className={fieldLabelVariants({ size })}>
      {legend}
    </span>
  )
}
