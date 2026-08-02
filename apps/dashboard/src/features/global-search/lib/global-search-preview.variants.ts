import { cva } from 'class-variance-authority'

/** Shared horizontal inset for preview panel list chrome (eyebrows, rows, show-all). */
export const globalSearchPreviewInsetClasses = 'px-3'

export const globalSearchPreviewBodyClasses = 'min-h-0 flex-1 overflow-y-auto'

export const globalSearchPreviewFooterClasses = 'shrink-0 border-t border-border bg-muted'

export const globalSearchPreviewGroupVariants = cva('', {
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

export const globalSearchPreviewGroupHeadingVariants = cva('border-b border-border bg-muted py-1', {
  variants: {
    first: {
      true: 'pt-2',
      false: '',
    },
    follows: {
      none: '',
      complete: 'border-t border-border',
      truncated: '',
    },
  },
  defaultVariants: {
    first: false,
    follows: 'none',
  },
})

export const globalSearchPreviewGroupListClasses = 'divide-y divide-border'

/** Quiet match count suffix in preview group headings (`CONTENT · 14`). */
export const globalSearchPreviewGroupHeadingCountClasses =
  'font-normal tabular-nums text-muted-foreground'

const previewActionLinkBase =
  'relative flex w-full select-none outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground'

/** Per-group overflow action in the preview dropdown. */
export const globalSearchPreviewShowAllLinkVariants = cva(
  `${previewActionLinkBase} mt-1 items-center py-1.5 text-xs font-body-emphasis`,
)

/** Pinned global footer action in the preview dropdown. */
export const globalSearchPreviewFooterLinkVariants = cva(
  `${previewActionLinkBase} items-center justify-center py-1.5 text-xs font-body-emphasis`,
)
