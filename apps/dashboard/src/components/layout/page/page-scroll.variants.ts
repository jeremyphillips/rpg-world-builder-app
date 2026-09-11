/** Overflow ownership for page width shells — independent of vertical inset. */
export const pageScrollClasses = {
  page: 'flex min-h-0 flex-1 flex-col overflow-y-auto',
  viewport: 'flex min-h-0 flex-1 flex-col overflow-hidden',
} as const

export type PageScroll = keyof typeof pageScrollClasses
