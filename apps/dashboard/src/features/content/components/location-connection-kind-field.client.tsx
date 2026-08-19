'use client'

import type { RadioCardOption } from '@rpg/ui'
import { Heading, RadioCardField, Text } from '@rpg/ui'

import type { LocationConnectionKindOption } from '../lib/location-connection-kind-options'

export type LocationConnectionKindFieldProps = {
  id: string
  label: string
  options: readonly LocationConnectionKindOption[]
  value: string | null
  onValueChange: (value: string) => void
  disabled?: boolean
}

export function toLocationConnectionKindRadioOptions(
  options: readonly LocationConnectionKindOption[],
): RadioCardOption[] {
  return options.map((option) => ({
    value: option.value,
    label: option.label,
    description: option.disabled ? option.disabledReason : option.description,
    disabled: option.disabled,
  }))
}

export function LocationConnectionKindField({
  id,
  label,
  options,
  value,
  onValueChange,
  disabled = false,
}: LocationConnectionKindFieldProps) {
  if (options.length === 0) {
    return null
  }

  if (options.length === 1) {
    const resolved = options[0]
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

  return (
    <RadioCardField
      id={id}
      label={label}
      density="compact"
      disabled={disabled}
      value={value ?? ''}
      options={toLocationConnectionKindRadioOptions(options)}
      onValueChange={onValueChange}
    />
  )
}
