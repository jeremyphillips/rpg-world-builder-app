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

export const BORDER_STRENGTH_CLASS_SPECS = [
  {
    key: 'subtle',
    className: 'ui-border--subtle',
    keyValues: 'foreground mix, subtle step',
    useCase: 'Structural separators',
  },
  {
    key: 'default',
    className: 'ui-border--default',
    keyValues: 'foreground mix, default step',
    useCase: 'Neutral component structure',
  },
  {
    key: 'strong',
    className: 'ui-border--strong',
    keyValues: 'foreground mix, strong step',
    useCase: 'Emphasized neutral structure',
  },
] as const

/** Resolves surface-relative neutral border contrast. Width, edge, style, and radius stay local. */
export function borderStrength(
  strength: BorderStrength = DEFAULT_BORDER_STRENGTH,
): (typeof UI_BORDER_STRENGTH_CLASSES)[number] {
  return BORDER_STRENGTH_CLASS[strength]
}
