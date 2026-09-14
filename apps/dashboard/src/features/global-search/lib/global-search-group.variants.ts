import { cva } from 'class-variance-authority'

/** Horizontal inset co-located with chrome that owns background, border, or hover fill. */
export const globalSearchGroupContentInsetClasses = 'px-3'

export const globalSearchGroupSectionVariants = cva('', {
  variants: {
    state: {
      truncated: 'pb-4',
      complete: '',
    },
  },
  defaultVariants: {
    state: 'complete',
  },
})

/** Quiet match count suffix in group headings (`Content · 14`). */
export const globalSearchGroupHeadingCountClasses = 'font-normal tabular-nums text-muted-foreground'

const groupActionLinkBase =
  'relative flex w-full select-none outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground'

/** Per-group overflow action when a section is truncated. */
export const globalSearchGroupShowAllLinkVariants = cva(
  `${groupActionLinkBase} mt-1 items-center py-1.5 text-xs font-body-emphasis`,
)
