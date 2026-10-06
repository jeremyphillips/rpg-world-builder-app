import type { RadioCardOption } from '@rpg/ui'

import type { LocationConnectionKindOption } from './location-connection-kind-options'

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
