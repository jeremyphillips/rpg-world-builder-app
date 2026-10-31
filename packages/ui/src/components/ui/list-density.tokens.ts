export const LIST_DENSITIES = ['compact', 'comfortable', 'spacious'] as const
export type ListDensity = (typeof LIST_DENSITIES)[number]

/** twMerge group — list typography / density modifiers on list roots. */
export const UI_LIST_DENSITY_CLASSES = [
  'ui-list--compact',
  'ui-list--comfortable',
  'ui-list--spacious',
] as const satisfies readonly `ui-list--${ListDensity}`[]
