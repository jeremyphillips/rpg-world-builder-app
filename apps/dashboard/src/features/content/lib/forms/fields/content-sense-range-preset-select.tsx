import { SelectField } from '@rpg/ui'

import { SENSE_RANGE_PLACEHOLDER, senseRangeSelectOptions } from './content-sense-range-form-fields'

/** Preset sense range control — matches species grant `senseRangeJoinedPairField` options. */
export function ContentSenseRangePresetSelect({
  id,
  label,
  value,
  onValueChange,
}: {
  id: string
  label: string
  value: number | undefined
  onValueChange: (value: number | undefined) => void
}) {
  return (
    <SelectField
      id={id}
      label={label}
      chrome={{ variant: 'none' }}
      options={senseRangeSelectOptions}
      placeholder={SENSE_RANGE_PLACEHOLDER}
      presentation="compact"
      value={value != null ? String(value) : ''}
      onValueChange={(next) => onValueChange(next ? Number(next) : undefined)}
      width="auto"
    />
  )
}
