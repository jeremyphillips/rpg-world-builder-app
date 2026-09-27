/** Uncapped main-column width (AppShell horizontal padding only). */
export const pageShellFullWidthClasses = 'w-full min-w-0'

/** Centered ~1280px page column — catalog detail, preview forms (Tailwind 7xl). */
export const pageShellWideWidthClasses = 'mx-auto w-full min-w-0 max-w-page-wide'

/** Centered ~900px page column — settings, simple forms, stubs. */
export const pageShellNarrowWidthClasses = 'mx-auto w-full min-w-0 max-w-page-narrow'

export const pageShellWidthClasses = {
  full: pageShellFullWidthClasses,
  wide: pageShellWideWidthClasses,
  narrow: pageShellNarrowWidthClasses,
} as const

export type PageWidth = keyof typeof pageShellWidthClasses
