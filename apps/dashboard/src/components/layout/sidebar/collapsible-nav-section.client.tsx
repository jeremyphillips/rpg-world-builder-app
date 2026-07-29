import { useId } from 'react'

import { cn, Collapsible, CollapsibleContent, CollapsibleTrigger, eyebrowVariants } from '@rpg/ui'

export type CollapsibleNavSectionProps = {
  label: string
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
  children: React.ReactNode
}

/** Controlled sidebar section disclosure — persistence stays in dashboard hooks. */
export function CollapsibleNavSection({
  label,
  expanded,
  onExpandedChange,
  children,
}: CollapsibleNavSectionProps) {
  const contentId = useId()

  return (
    <Collapsible
      open={expanded}
      onOpenChange={onExpandedChange}
      className="mb-2.5 flex flex-col gap-1"
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex w-full items-center gap-2 px-3 pb-1 pt-3 text-left',
            'rounded-md transition-colors hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          )}
          aria-expanded={expanded}
          aria-controls={contentId}
        >
          <span className={eyebrowVariants()}>{label}</span>
          <span
            aria-hidden
            className={cn(
              'ml-auto size-2 shrink-0 rotate-45 border-r border-b border-muted-foreground transition-transform',
              expanded ? '-translate-y-0.5' : 'translate-y-0.5 rotate-[225deg]',
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent id={contentId}>{children}</CollapsibleContent>
    </Collapsible>
  )
}
