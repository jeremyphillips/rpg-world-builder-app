import type { ButtonVariantProps } from '../../../components/ui/button.variants'
import { resolveCollectionAddDisabledProps } from '../../../components/ui/collection-add-control.lib'
import type { ArrayAddActionLayout } from '../../field-config'

export function resolveArrayAddButtonDensity(
  layout: ArrayAddActionLayout,
  variant: NonNullable<ButtonVariantProps['variant']>,
): ButtonVariantProps['density'] | undefined {
  return layout === 'inline' && variant === 'text' ? 'compact' : undefined
}

export const resolveArrayAddDisabledProps = resolveCollectionAddDisabledProps
