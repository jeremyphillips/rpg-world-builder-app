import { badgeAppearanceToneClasses, type BadgeAppearance } from './badge-appearance.lib'

export const COMPACT_LABEL_TONES = ['neutral', 'info', 'success', 'warning', 'destructive'] as const

export const COMPACT_LABEL_SIZES = ['sm', 'md', 'lg'] as const

export const COMPACT_LABEL_EMPHASES = ['default', 'subdued'] as const

export type CompactLabelTone = (typeof COMPACT_LABEL_TONES)[number]
export type CompactLabelAppearance = BadgeAppearance
export type CompactLabelSize = (typeof COMPACT_LABEL_SIZES)[number]
export type CompactLabelEmphasis = (typeof COMPACT_LABEL_EMPHASES)[number]

/** Visual weight, orthogonal to tone. Subdued is muted copy, not a disabled control. */
export function compactLabelEmphasisClasses(
  emphasis: CompactLabelEmphasis = 'default',
): string | null {
  return emphasis === 'subdued' ? 'text-muted-foreground' : null
}

/** Appearance × tone surface classes for Badge (not selected-control chip state). */
export function compactLabelAppearanceToneClasses(
  appearance: CompactLabelAppearance,
  tone: CompactLabelTone,
): string {
  return badgeAppearanceToneClasses(appearance, tone)
}
