/** Centered narrow-column page shell shared by settings, forms, and stub routes. */
export const narrowPageBaseClasses = 'mx-auto max-w-3xl'

export const narrowPageSpacingClasses = {
  compact: 'space-y-2',
  relaxed: 'space-y-6',
  loose: 'space-y-10',
} as const

export type NarrowPageSpacing = keyof typeof narrowPageSpacingClasses
