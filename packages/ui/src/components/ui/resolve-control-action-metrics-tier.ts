import {
  CONTROL_ACTION_GAP_CLASSES,
  type ControlActionMetricsTier,
} from './control-action.variants'

type LabeledButtonSize = 'default' | 'xs' | 'sm' | 'lg'
type LabeledButtonDensity = 'default' | 'compact'
type LabeledButtonVariant =
  | 'default'
  | 'destructive'
  | 'warning'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'text'
  | 'attached'

function resolveTextMetricsTier(
  size: LabeledButtonSize,
  density: LabeledButtonDensity,
): ControlActionMetricsTier {
  if (size === 'xs' && density === 'compact') return 'xs'
  if (size === 'xs') return 'sm'
  if (density === 'compact') return 'xs'
  if (size === 'sm') return 'sm'
  return 'md'
}

function resolveAttachedMetricsTier(size: LabeledButtonSize): ControlActionMetricsTier {
  if (size === 'sm') return 'sm'
  if (size === 'xs') return 'xs'
  return 'md'
}

function resolveChromeMetricsTier(
  size: LabeledButtonSize,
  density: LabeledButtonDensity,
): ControlActionMetricsTier {
  if (size === 'lg') return 'md'
  if (size === 'sm') return density === 'compact' ? 'xs' : 'sm'
  return density === 'compact' ? 'sm' : 'md'
}

/**
 * Effective control-action tier for labeled actions (glyph + gap + height recipes).
 * Icon-only button sizes are omitted — flex gap has no effect with a single child.
 */
export function resolveControlActionMetricsTier(
  size: LabeledButtonSize = 'default',
  density: LabeledButtonDensity = 'default',
  variant: LabeledButtonVariant = 'default',
): ControlActionMetricsTier {
  if (variant === 'text') return resolveTextMetricsTier(size, density)
  if (size === 'xs') return 'xs'
  if (variant === 'attached') return resolveAttachedMetricsTier(size)
  return resolveChromeMetricsTier(size, density)
}

export function controlActionGapClassesForTier(tier: ControlActionMetricsTier): string {
  return CONTROL_ACTION_GAP_CLASSES[tier]
}
