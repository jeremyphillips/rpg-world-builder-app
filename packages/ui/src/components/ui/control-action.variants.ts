import type { ButtonSize, ButtonVariantProps } from './button.variants'

export type ControlActionMetricsTier = 'xs' | 'sm' | 'md'

type ButtonVariant = NonNullable<ButtonVariantProps['variant']>

function resolveAttachedMetricsTier(size: ButtonSize): ControlActionMetricsTier {
  if (size === 'xs') return 'xs'
  if (size === 'sm') return 'sm'
  return 'md'
}

function resolveTextMetricsTier(size: ButtonSize): ControlActionMetricsTier {
  if (size === 'xs') return 'xs'
  return 'sm'
}

function resolveChromeMetricsTier(size: ButtonSize): ControlActionMetricsTier {
  if (size === 'xs' || size === 'icon-xs') return 'xs'
  if (size === 'sm' || size === 'icon-sm') return 'sm'
  return 'md'
}

/**
 * Effective control-action tier for labeled actions (glyph + gap + height recipes).
 * Icon-only button sizes map to tiers for completeness; flex gap has no effect with a single child.
 */
export function resolveControlActionMetricsTier(
  size: ButtonSize = 'default',
  variant: ButtonVariant = 'default',
): ControlActionMetricsTier {
  if (variant === 'text') return resolveTextMetricsTier(size)
  if (variant === 'attached') return resolveAttachedMetricsTier(size)
  return resolveChromeMetricsTier(size)
}
