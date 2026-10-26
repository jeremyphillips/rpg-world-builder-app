import { badgeAppearanceToneClasses, type BadgeAppearance } from './badge-appearance.lib'

export const COMPACT_LABEL_TONES = ['neutral', 'info', 'success', 'warning', 'destructive'] as const

export const CHIP_SIZES = ['xs', 'sm', 'md', 'lg'] as const

export type ChipSize = (typeof CHIP_SIZES)[number]

/** twMerge group — chip size modifiers. */
export const UI_CHIP_SIZE_CLASSES = CHIP_SIZES.map((size) => `ui-chip--${size}` as const)

export function chipSizeClass(size: ChipSize): (typeof UI_CHIP_SIZE_CLASSES)[number] {
  return `ui-chip--${size}`
}

export function chipRemovablePaddingClass(size: ChipSize): `ui-chip--removable-${ChipSize}` {
  return `ui-chip--removable-${size}`
}

export const COMPACT_LABEL_EMPHASES = ['default', 'subdued'] as const

export type CompactLabelTone = (typeof COMPACT_LABEL_TONES)[number]
export type CompactLabelAppearance = BadgeAppearance
export type CompactLabelEmphasis = (typeof COMPACT_LABEL_EMPHASES)[number]

/** Visual weight, orthogonal to tone. Subdued is muted copy, not a disabled control. */
export function compactLabelEmphasisClasses(
  emphasis: CompactLabelEmphasis = 'default',
): string | null {
  return emphasis === 'subdued' ? 'ui-compact-label--subdued' : null
}

/** Appearance × tone surface classes for Badge (not selected-control chip state). */
export function compactLabelAppearanceToneClasses(
  appearance: CompactLabelAppearance,
  tone: CompactLabelTone,
): string {
  const appearanceClasses = badgeAppearanceToneClasses(appearance, tone)
  return tone === 'neutral' ? `${appearanceClasses} ui-border--default` : appearanceClasses
}
