'use client'

import { useId } from 'react'
import { ChevronDown } from 'lucide-react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible.client'
import { Eyebrow } from './eyebrow'
import {
  sidebarNavSectionDisclosureCaretVariants,
  sidebarNavSectionDisclosureContentClasses,
  sidebarNavSectionDisclosureRootClasses,
  sidebarNavSectionDisclosureStaticHeaderClasses,
  sidebarNavSectionDisclosureTriggerClasses,
} from './sidebar-nav-section-disclosure.variants'

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
      className={sidebarNavSectionDisclosureRootClasses}
    >
      {disabled ? (
        <div className={sidebarNavSectionDisclosureStaticHeaderClasses}>
          <Eyebrow as="span">{label}</Eyebrow>
        </div>
      ) : (
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className={sidebarNavSectionDisclosureTriggerClasses}
            aria-expanded={expanded}
            aria-controls={contentId}
          >
            <Eyebrow as="span">{label}</Eyebrow>
            <ChevronDown
              aria-hidden
              className={sidebarNavSectionDisclosureCaretVariants({ expanded })}
            />
          </button>
        </CollapsibleTrigger>
      )}
      <CollapsibleContent id={contentId} className={sidebarNavSectionDisclosureContentClasses}>
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
