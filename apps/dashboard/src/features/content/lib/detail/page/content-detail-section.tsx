import { createContext, useContext, useLayoutEffect, type ReactNode } from 'react'
import { Heading } from '@rpg/ui'

import { DetailCollectionPanel } from '../collection/panel/detail-collection-panel'
import type { DetailCollectionPanelProps } from '../collection/panel/detail-collection-panel'

import { useContentDetailNavRegistration } from './content-detail-nav-context'
import {
  contentDetailSectionItemStackClasses,
  contentDetailSectionPanelContentHeadingClasses,
  contentDetailSectionProseBodyClasses,
} from './content-detail-section.variants'

const ContentDetailSectionScopeContext = createContext<string | null>(null)

export type ContentDetailSectionBodyLayout = 'prose' | 'list' | 'flush'

export type ContentDetailSectionProps = Omit<
  DetailCollectionPanelProps,
  'headerSurface' | 'bodySurface'
> & {
  /**
   * Semantic body chrome contract (not “looks unpadded”):
   * - `prose` — section applies outer padding
   * - `list` — host owns row/list chrome (RelationshipList, …)
   * - `flush` — full-bleed child owns layout (tables, flush item stacks, …)
   */
  bodyLayout?: ContentDetailSectionBodyLayout
}

export function ContentDetailSection({
  bodyLayout = 'prose',
  children,
  heading,
  headingId,
  ...panelProps
}: ContentDetailSectionProps) {
  const { registerSection } = useContentDetailNavRegistration()

  useLayoutEffect(() => {
    return registerSection(headingId, heading)
  }, [heading, headingId, registerSection])

  return (
    <ContentDetailSectionScopeContext.Provider value={headingId}>
      <DetailCollectionPanel
        heading={heading}
        headingId={headingId}
        headerSurface="muted"
        bodySurface="faint"
        {...panelProps}
      >
        {bodyLayout === 'prose' ? (
          <div className={contentDetailSectionProseBodyClasses}>{children}</div>
        ) : (
          children
        )}
      </DetailCollectionPanel>
    </ContentDetailSectionScopeContext.Provider>
  )
}

/** Registers an in-page nav leaf under the current section (no visible chrome). */
export function useContentDetailSectionNavLeaf(id: string, label: string) {
  const sectionId = useContext(ContentDetailSectionScopeContext)
  const { registerLeaf } = useContentDetailNavRegistration()

  useLayoutEffect(() => {
    if (!sectionId) return undefined
    return registerLeaf(sectionId, id, label)
  }, [id, label, registerLeaf, sectionId])

  if (!sectionId) {
    throw new Error('useContentDetailSectionNavLeaf must be used inside ContentDetailSection')
  }
}

export type ContentDetailSectionItemProps = {
  id: string
  /** Visible subsection heading and default nav leaf label. */
  label: string
  /** Nav leaf label when it should differ from the visible heading. */
  navLabel?: string
  children?: ReactNode
  className?: string
}

export function ContentDetailSectionItem({
  id,
  label,
  navLabel,
  children,
  className,
}: ContentDetailSectionItemProps) {
  const sectionId = useContext(ContentDetailSectionScopeContext)
  const { registerLeaf } = useContentDetailNavRegistration()
  const resolvedNavLabel = navLabel ?? label

  useLayoutEffect(() => {
    if (!sectionId) return undefined
    return registerLeaf(sectionId, id, resolvedNavLabel)
  }, [id, registerLeaf, resolvedNavLabel, sectionId])

  if (!sectionId) {
    throw new Error('ContentDetailSectionItem must be rendered inside ContentDetailSection')
  }

  return (
    <div className={className ?? contentDetailSectionItemStackClasses}>
      <Heading
        variant="subsection"
        as="h3"
        id={id}
        className={contentDetailSectionPanelContentHeadingClasses}
      >
        {label}
      </Heading>
      {children}
    </div>
  )
}

/** Panel content heading styles for custom in-panel titles (e.g. class feature rows). */
export { contentDetailSectionPanelContentHeadingClasses }
