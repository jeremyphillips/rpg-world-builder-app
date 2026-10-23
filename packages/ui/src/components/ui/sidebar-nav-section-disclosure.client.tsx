'use client'

import { useId } from 'react'

import { DisclosureIndicator } from './disclosure-indicator.client'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible.client'
import { Eyebrow } from './eyebrow'

export type SidebarNavSectionDisclosureProps = {
  label: string
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
  /** When true, the section stays open and the heading is non-interactive. */
  disabled?: boolean
  children: React.ReactNode
}

/** Controlled sidebar section disclosure — persistence and route forcing stay in app hooks. */
export function SidebarNavSectionDisclosure({
  label,
  expanded,
  onExpandedChange,
  disabled = false,
  children,
}: SidebarNavSectionDisclosureProps) {
  const contentId = useId()

  return (
    <Collapsible
      open={expanded}
      onOpenChange={disabled ? undefined : onExpandedChange}
      className="mb-2.5 flex flex-col gap-1"
    >
      {disabled ? (
        <div className="flex w-full items-center gap-2 px-3 pb-1 pt-3 text-left">
          <Eyebrow as="span">{label}</Eyebrow>
        </div>
      ) : (
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 pb-1 pt-3 text-left transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-expanded={expanded}
            aria-controls={contentId}
          >
            <Eyebrow as="span">{label}</Eyebrow>
            <DisclosureIndicator size="lg" className="ml-auto shrink-0 text-muted-foreground" />
          </button>
        </CollapsibleTrigger>
      )}
      <CollapsibleContent id={contentId} className="flex flex-col gap-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
