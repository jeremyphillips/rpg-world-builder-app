/** Vertical rhythm between direct children of page width shells. */
export const pageSpacingClasses = {
  compact: 'space-y-2',
  list: 'space-y-4',
  relaxed: 'space-y-6',
  loose: 'space-y-10',
} as const

export type PageSpacing = keyof typeof pageSpacingClasses
