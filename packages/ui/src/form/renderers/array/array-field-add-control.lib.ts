import type { ButtonVariantProps } from '../../../components/ui/button.variants'
import type { ArrayAddActionLayout } from '../../field-config'

export function resolveArrayAddButtonDensity(
  layout: ArrayAddActionLayout,
  variant: NonNullable<ButtonVariantProps['variant']>,
): ButtonVariantProps['density'] | undefined {
  return layout === 'inline' && variant === 'text' ? 'compact' : undefined
}

export function resolveArrayAddDisabledProps(
  addEnabled: boolean,
  addDisabledReason?: string,
  disabledReasonId?: string,
): {
  disabled?: true
  title?: string
  'aria-disabled'?: true
  'aria-describedby'?: string
} {
  if (addEnabled) return {}

  return {
    disabled: true,
    title: addDisabledReason,
    'aria-disabled': true,
    'aria-describedby': addDisabledReason ? disabledReasonId : undefined,
  }
}
