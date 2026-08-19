'use client'

import { CollapsibleRadioCardField } from '@rpg/ui'

import { LOCATION_CONNECTION_KIND_CHANGE_LABEL } from '../lib/location-connection-drawer-intent'
import type { LocationConnectionKindOption } from '../lib/location-connection-kind-options'
import {
  LocationConnectionKindField,
  toLocationConnectionKindRadioOptions,
} from './location-connection-kind-field.client'

export type LocationConnectionKindStepProps = {
  id: string
  label: string
  options: readonly LocationConnectionKindOption[]
  value: string | null
  onValueChange: (value: string) => void
  changeLabel?: string
  summaryEyebrow?: string
  /** When true, eligible options render immediately instead of behind a collapsed summary. */
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
}

export function LocationConnectionKindStep({
  id,
  label,
  options,
  value,
  onValueChange,
  changeLabel = LOCATION_CONNECTION_KIND_CHANGE_LABEL,
  summaryEyebrow,
  defaultExpanded,
  onExpandedChange,
}: LocationConnectionKindStepProps) {
  if (options.length <= 1) {
    return (
      <LocationConnectionKindField
        id={id}
        label={label}
        options={options}
        value={value}
        onValueChange={onValueChange}
      />
    )
  }

  return (
    <CollapsibleRadioCardField
      id={id}
      label={label}
      summaryEyebrow={summaryEyebrow ?? label}
      changeLabel={changeLabel}
      density="compact"
      value={value ?? ''}
      options={toLocationConnectionKindRadioOptions(options)}
      onValueChange={onValueChange}
      defaultExpanded={defaultExpanded}
      onExpandedChange={onExpandedChange}
    />
  )
}
