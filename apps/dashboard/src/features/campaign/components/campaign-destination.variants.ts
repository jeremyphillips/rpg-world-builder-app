import { cva } from 'class-variance-authority'

import { cn, interactiveFocusVariants, interactiveRowVariants } from '@rpg/ui'

/** Bordered campaign destination list shell shared by overview and dashboard promotions. */
export const campaignDestinationListVariants = cva(
  'divide-y divide-border rounded-lg border border-border bg-card',
)

/** Full-width destination row inside a campaign destination list. */
export const campaignDestinationRowVariants = cva(
  cn(
    'flex w-full items-center gap-3 p-6 text-left',
    interactiveRowVariants({ interaction: 'hoverable', hoverFamily: 'navigation' }),
    interactiveFocusVariants({ context: 'standalone' }),
  ),
)

export const campaignDestinationChevronClasses = 'size-5 shrink-0 text-muted-foreground'
