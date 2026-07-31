import { cva } from 'class-variance-authority'

/** Bordered campaign destination list shell shared by overview and dashboard promotions. */
export const campaignDestinationListVariants = cva(
  'divide-y divide-border rounded-lg border border-border bg-card',
)

/** Full-width destination row inside a campaign destination list. */
export const campaignDestinationRowVariants = cva(
  'flex w-full items-center gap-3 p-6 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
)

export const campaignDestinationChevronClasses = 'size-5 shrink-0 text-muted-foreground'
