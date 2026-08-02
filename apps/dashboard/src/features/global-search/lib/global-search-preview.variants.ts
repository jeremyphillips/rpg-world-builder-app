import { cva } from 'class-variance-authority'

/** Shared horizontal inset for preview panel list chrome (eyebrows, rows, show-all). */
export const globalSearchPreviewInsetClasses = 'px-3'

export const globalSearchPreviewBodyClasses = 'min-h-0 flex-1 overflow-y-auto'

export const globalSearchPreviewFooterClasses = 'shrink-0 border-t border-border bg-muted'

const previewActionLinkBase =
  'relative flex w-full select-none outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground'

/** Pinned global footer action in the preview dropdown. */
export const globalSearchPreviewFooterLinkVariants = cva(
  `${previewActionLinkBase} items-center justify-center py-1.5 text-xs font-body-emphasis`,
)
