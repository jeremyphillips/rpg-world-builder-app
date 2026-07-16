export const COMPACT_LABEL_TONES = [
  'neutral',
  'informative',
  'positive',
  'caution',
  'negative',
] as const

export const COMPACT_LABEL_APPEARANCES = ['outline', 'accent-outline', 'soft', 'neutral'] as const

export const COMPACT_LABEL_SIZES = ['sm', 'md', 'lg'] as const

export type CompactLabelTone = (typeof COMPACT_LABEL_TONES)[number]
export type CompactLabelAppearance = (typeof COMPACT_LABEL_APPEARANCES)[number]
export type CompactLabelSize = (typeof COMPACT_LABEL_SIZES)[number]

export function compactLabelFilledFromAppearance(appearance: CompactLabelAppearance): boolean {
  return appearance === 'soft' || appearance === 'neutral'
}

const toneTextClass: Record<CompactLabelTone, string> = {
  neutral: 'text-semantic-neutral',
  informative: 'text-semantic-informative',
  positive: 'text-semantic-positive',
  caution: 'text-semantic-caution',
  negative: 'text-semantic-negative',
}

const toneBorderClass: Record<CompactLabelTone, string> = {
  neutral: 'border-semantic-neutral-border',
  informative: 'border-semantic-informative-border',
  positive: 'border-semantic-positive-border',
  caution: 'border-semantic-caution-border',
  negative: 'border-semantic-negative-border',
}

const toneSoftTextClass: Record<CompactLabelTone, string> = {
  neutral: toneTextClass.neutral,
  informative: toneTextClass.informative,
  positive: toneTextClass.positive,
  caution: toneTextClass.caution,
  negative: 'text-semantic-negative-on-subtle',
}

const toneSubtleBgClass: Record<CompactLabelTone, string> = {
  neutral: 'bg-semantic-neutral-subtle',
  informative: 'bg-semantic-informative-subtle',
  positive: 'bg-semantic-positive-subtle',
  caution: 'bg-semantic-caution-subtle',
  negative: 'bg-semantic-negative-subtle',
}

/** Appearance × tone surface classes for Badge (not selected-control chip state). */
export function compactLabelAppearanceToneClasses(
  appearance: CompactLabelAppearance,
  tone: CompactLabelTone,
): string {
  if (appearance === 'neutral') {
    return 'border-semantic-neutral-border bg-semantic-neutral-subtle text-foreground'
  }

  if (appearance === 'outline') {
    return `border ${toneBorderClass[tone]} bg-transparent text-foreground`
  }

  if (appearance === 'accent-outline') {
    return `border ${toneBorderClass[tone]} bg-transparent ${toneTextClass[tone]}`
  }

  return `border ${toneBorderClass[tone]} ${toneSubtleBgClass[tone]} ${toneSoftTextClass[tone]}`
}
