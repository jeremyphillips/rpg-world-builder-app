/** Shared neutral border ladder for field separators and outline chrome. */
export const FIELD_BORDER_LADDER_TONES = ['faint', 'subtle', 'default', 'strong'] as const

export type FieldBorderLadderTone = (typeof FIELD_BORDER_LADDER_TONES)[number]

export const DEFAULT_FIELD_BORDER_LADDER_TONE: FieldBorderLadderTone = 'subtle'

export const fieldBorderLadderToneClasses = {
  faint: 'border-border-faint',
  subtle: 'border-border-subtle',
  default: 'border-border',
  strong: 'border-border-strong',
} satisfies Record<FieldBorderLadderTone, string>

export function isFieldBorderLadderTone(value: string): value is FieldBorderLadderTone {
  return (FIELD_BORDER_LADDER_TONES as readonly string[]).includes(value)
}

/** Resolves a border-ladder utility for separators, outline chrome, and similar shells. */
export function resolveFieldBorderLadderToneClasses(
  tone: FieldBorderLadderTone = DEFAULT_FIELD_BORDER_LADDER_TONE,
): string {
  return fieldBorderLadderToneClasses[tone]
}
