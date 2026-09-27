import { createContext, useContext, useLayoutEffect, type ReactNode } from 'react'
import { Heading } from '@rpg/ui'

import { DetailCollectionPanel } from '../collection/panel/detail-collection-panel'
import type { DetailCollectionPanelProps } from '../collection/panel/detail-collection-panel'

import { useContentDetailNavRegistration } from './content-detail-nav-context'
import {
  contentDetailSectionItemStackClasses,
  contentDetailSectionProseBodyClasses,
} from './content-detail-section.variants'

const ContentDetailSectionScopeContext = createContext<string | null>(null)

export type ContentDetailSectionProps = Omit<
  DetailCollectionPanelProps,
  'headerSurface' | 'bodySurface'
> & {
  /** Prose panels pad the body; list panels rely on inner list chrome (e.g. RelationshipList). */
  bodyLayout?: 'prose' | 'list'
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
      <Heading variant="subsection" as="h3" id={id}>
        {label}
      </Heading>
      {children}
    </div>
  )
}
