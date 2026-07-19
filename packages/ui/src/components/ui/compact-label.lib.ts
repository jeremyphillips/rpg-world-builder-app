export const COMPACT_LABEL_TONES = ['neutral', 'info', 'success', 'warning', 'destructive'] as const

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
  info: 'text-semantic-info',
  success: 'text-semantic-success',
  warning: 'text-semantic-warning',
  destructive: 'text-semantic-destructive',
}

const toneBorderClass: Record<CompactLabelTone, string> = {
  neutral: 'border-semantic-neutral-border',
  info: 'border-semantic-info-border',
  success: 'border-semantic-success-border',
  warning: 'border-semantic-warning-border',
  destructive: 'border-semantic-destructive-border',
}

const toneSoftTextClass: Record<CompactLabelTone, string> = {
  neutral: toneTextClass.neutral,
  info: toneTextClass.info,
  success: toneTextClass.success,
  warning: toneTextClass.warning,
  destructive: 'text-semantic-destructive-on-subtle',
}

const toneSubtleBgClass: Record<CompactLabelTone, string> = {
  neutral: 'bg-semantic-neutral-subtle',
  info: 'bg-semantic-info-subtle',
  success: 'bg-semantic-success-subtle',
  warning: 'bg-semantic-warning-subtle',
  destructive: 'bg-semantic-destructive-subtle',
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
