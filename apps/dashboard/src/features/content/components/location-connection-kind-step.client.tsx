'use client'

import type { RadioCardOption } from '@rpg/ui'
import { Heading, RadioCardField, Text } from '@rpg/ui'

import type { LocationConnectionKindOption } from '../lib/location-connection-kind-options'

export type LocationConnectionKindStepProps = {
  id: string
  label: string
  options: readonly LocationConnectionKindOption[]
  value: string | null
  onValueChange: (value: string) => void
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
    <RadioCardField
      id={id}
      label={label}
      value={value ?? ''}
      options={toRadioCardOptions(options)}
      onValueChange={onValueChange}
    />
  )
}
