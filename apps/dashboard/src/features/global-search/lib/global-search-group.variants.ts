import { cva } from 'class-variance-authority'

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

/** Per-group overflow action when a section is truncated. */
export const globalSearchGroupShowAllLinkVariants =
  'relative flex w-full cursor-pointer select-none outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground mt-1 items-center py-1.5 text-style-label'
