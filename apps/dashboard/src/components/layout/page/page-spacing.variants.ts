/** Vertical shell inset below the breadcrumb rail — not child rhythm. */
export const pageShellInsetClasses = {
  page: 'py-8',
  none: '',
} as const

export type PageShellInset = keyof typeof pageShellInsetClasses

/** Vertical rhythm between direct children of page width shells. */
export const pageSpacingClasses = {
  compact: 'space-y-2',
  list: 'space-y-4',
  relaxed: 'space-y-6',
  loose: 'space-y-10',
} as const

export type PageRhythm = keyof typeof pageSpacingClasses

/** Stack spacing between `PageHeader` and the section directly below it. */
export const pageHeaderSectionGapClasses = 'flex flex-col gap-4'

/** @deprecated Use {@link PageRhythm} — spacing prop now means shell inset only. */
export type PageSpacing = PageRhythm
