/** Clip shell — viewport scrolls; bottom boundary shadow docks to this root. */
export const sheetMediaScrollRootVariants = 'relative flex min-h-0 flex-1 flex-col'

/** Single scrollport for media, sticky identity header, and padded body content. */
export const sheetMediaScrollViewportVariants =
  'flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-slim text-sm'

export const sheetMediaScrollMediaVariants = 'shrink-0 w-full overflow-hidden'

/** Observed boundary between media and the sticky identity header. */
export const sheetMediaScrollSentinelVariants = 'pointer-events-none h-px w-full shrink-0'

export const sheetMediaScrollStickyHeaderVariants =
  'sticky top-0 z-10 shrink-0 border-b ui-border--subtle data-[stuck=true]:bg-[var(--surface-current)]'

/** Scroll affordance below the pinned header separator — not the viewport top edge. */
export const sheetMediaScrollStickyHeaderShadowVariants =
  'pointer-events-none absolute inset-x-0 top-full z-10 h-2.5 bg-gradient-to-b from-[color-mix(in_oklch,var(--foreground)_5%,transparent)] to-transparent opacity-0 transition-opacity duration-150 data-[visible=true]:opacity-100'

export const sheetMediaScrollBodyVariants = 'px-6 pe-6 pt-5 pb-6'
