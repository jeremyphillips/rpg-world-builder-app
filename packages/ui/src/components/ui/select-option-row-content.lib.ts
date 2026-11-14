import { cn } from '../../lib/utils'
import type { SelectOptionTrailing } from '../../form/field-config/field-options'

export function selectOptionTrailingClassName(
  variant: SelectOptionTrailing['variant'] | 'disabled-reason',
): string {
  if (variant === 'disabled-reason') {
    return 'ui-select-option-trailing ui-select-option-trailing--disabled-reason'
  }
  return cn(
    'ui-select-option-trailing',
    variant === 'strong' && 'ui-select-option-trailing--strong',
  )
}

export function resolveSelectOptionTrailingColumn(input: {
  disabled?: boolean
  disabledReason?: string
  trailing?: SelectOptionTrailing
}): { text: string; variant: SelectOptionTrailing['variant'] | 'disabled-reason' } | undefined {
  if (input.disabled && input.disabledReason) {
    return { text: input.disabledReason, variant: 'disabled-reason' }
  }
  if (input.trailing?.text) {
    return { text: input.trailing.text, variant: input.trailing.variant ?? 'quiet' }
  }
  return undefined
}
