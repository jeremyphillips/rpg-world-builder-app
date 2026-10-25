import { cva } from 'class-variance-authority'
import { cn, establishSurfaceCurrent } from '@rpg/ui'

/** Faint band for group headings inside transparent search panels (matches {@code .ui-interactive-list__heading}). */
export const globalSearchGroupHeadingClasses = cn(
  'bg-surface-faint',
  establishSurfaceCurrent('surface-faint'),
)

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

/** Per-group overflow action when a section is truncated. */
export const globalSearchGroupShowAllLinkVariants =
  'relative flex w-full cursor-pointer select-none outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground mt-1 items-center py-1.5 text-style-label'
