'use client'

import { useId } from 'react'

import { cn } from '../../lib/utils'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible.client'
import { eyebrowVariants } from './eyebrow.variants'
import {
  sidebarNavSectionDisclosureCaretClasses,
  sidebarNavSectionDisclosureContentClasses,
  sidebarNavSectionDisclosureRootClasses,
  sidebarNavSectionDisclosureTriggerClasses,
} from './sidebar-nav-section-disclosure.variants'

export type SidebarNavSectionDisclosureProps = {
  label: string
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
  children: React.ReactNode
}

/** Controlled sidebar section disclosure — persistence and route forcing stay in app hooks. */
export function SidebarNavSectionDisclosure({
  label,
  expanded,
  onExpandedChange,
  children,
}: SidebarNavSectionDisclosureProps) {
  const contentId = useId()

  return (
    <Collapsible
      open={expanded}
      onOpenChange={onExpandedChange}
      className={sidebarNavSectionDisclosureRootClasses}
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={sidebarNavSectionDisclosureTriggerClasses}
          aria-expanded={expanded}
          aria-controls={contentId}
        >
          <span className={eyebrowVariants()}>{label}</span>
          <span
            aria-hidden
            className={cn(
              sidebarNavSectionDisclosureCaretClasses,
              expanded ? '-translate-y-0.5' : 'translate-y-0.5 rotate-[225deg]',
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent id={contentId} className={sidebarNavSectionDisclosureContentClasses}>
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
