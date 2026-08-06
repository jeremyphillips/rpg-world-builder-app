'use client'

import type { RadioCardOption } from '@rpg/ui'
import { CollapsibleRadioCardField, Heading, Text } from '@rpg/ui'

import { LOCATION_CONNECTION_KIND_CHANGE_LABEL } from '../lib/location-connection-drawer-intent'
import type { LocationConnectionKindOption } from '../lib/location-connection-kind-options'

export type LocationConnectionKindStepProps = {
  id: string
  label: string
  options: readonly LocationConnectionKindOption[]
  value: string | null
  onValueChange: (value: string) => void
  changeLabel?: string
  /** When true, eligible options render immediately instead of behind a collapsed summary. */
  defaultExpanded?: boolean
}

function toRadioCardOptions(options: readonly LocationConnectionKindOption[]): RadioCardOption[] {
  return options.map((option) => ({
    value: option.value,
    label: option.label,
    description: option.disabled ? option.disabledReason : option.description,
    disabled: option.disabled,
  }))
}

export function LocationConnectionKindStep({
  id,
  label,
  options,
  value,
  onValueChange,
  changeLabel = LOCATION_CONNECTION_KIND_CHANGE_LABEL,
  defaultExpanded,
}: LocationConnectionKindStepProps) {
  const enabledOptions = options.filter((option) => !option.disabled)

  if (enabledOptions.length === 1) {
    const resolved = enabledOptions[0]
    if (!resolved) return null

    return (
      <div className="space-y-1">
        <Heading variant="label" as="p">
          {label}
        </Heading>
        <Text>{resolved.label}</Text>
      </div>
    )
  }

  if (options.length === 0) {
    return null
  }

  return (
    <CollapsibleRadioCardField
      id={id}
      label={label}
      summaryEyebrow={label}
      changeLabel={changeLabel}
      density="compact"
      value={value ?? ''}
      options={toRadioCardOptions(options)}
      onValueChange={onValueChange}
      defaultExpanded={defaultExpanded}
    />
  )
}
