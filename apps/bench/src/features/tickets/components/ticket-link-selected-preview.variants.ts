export const ticketLinkSelectedPreviewClasses =
  'flex items-start justify-between gap-2 rounded-md border border-border bg-card px-3 py-2'

export const ticketLinkSelectedPreviewBodyClasses = 'min-w-0 flex-1 space-y-0.5'

export const ticketLinkSelectedPreviewLinkClasses = [
  ticketLinkSelectedPreviewBodyClasses,
  'rounded-sm hover:underline ui-focus-ring',
].join(' ')

export const ticketLinkSelectedPreviewKeyClasses = 'font-mono text-style-caption'

export const ticketLinkSelectedPreviewTitleClasses = 'truncate text-sm'

export const ticketLinkSelectedPreviewRemoveClasses =
  'inline-flex shrink-0 rounded-sm text-muted-foreground transition-colors hover:text-foreground ui-focus-ring disabled:pointer-events-none disabled:opacity-50'
