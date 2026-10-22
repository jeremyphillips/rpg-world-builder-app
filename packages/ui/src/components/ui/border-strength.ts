export const BORDER_STRENGTHS = ['subtle', 'default', 'strong'] as const

export type BorderStrength = (typeof BORDER_STRENGTHS)[number]

export const DEFAULT_BORDER_STRENGTH: BorderStrength = 'default'

export const UI_BORDER_STRENGTH_CLASSES = [
  'ui-border--subtle',
  'ui-border--default',
  'ui-border--strong',
] as const satisfies readonly `ui-border--${BorderStrength}`[]

const BORDER_STRENGTH_CLASS = {
  subtle: 'ui-border--subtle',
  default: 'ui-border--default',
  strong: 'ui-border--strong',
} as const satisfies Record<BorderStrength, (typeof UI_BORDER_STRENGTH_CLASSES)[number]>

/** Resolves surface-relative neutral border contrast. Width, edge, style, and radius stay local. */
export function borderStrength(
  strength: BorderStrength = DEFAULT_BORDER_STRENGTH,
): (typeof UI_BORDER_STRENGTH_CLASSES)[number] {
  return BORDER_STRENGTH_CLASS[strength]
}
