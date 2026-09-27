import type { ReactNode } from 'react'
import { RichTextContent } from '@rpg/ui'
import type { ContentDisplayFallback, ContentDisplayImage } from '@rpg/contracts'

import { ContentDetailLayout } from '../../../lib/detail/page/content-detail-layout'
import { contentDetailNavItemId } from '../../../lib/detail/page/content-detail-nav-anchor-id'
import {
  ContentDetailSection,
  ContentDetailSectionItem,
} from '../../../lib/detail/page/content-detail-section'
import type { SpeciesDetailItem, SpeciesDetailViewModel } from '../../lib/species-display'

const TRAITS_HEADING_ID = 'traits-heading'

function TraitItemBody({ item }: { item: SpeciesDetailItem }) {
  return <>{item.bodyHtml && <RichTextContent html={item.bodyHtml} size="md" tone="muted" />}</>
}

function TraitsSection({
  section,
}: {
  section: Extract<SpeciesDetailViewModel['sections'][number], { id: 'traits' }>
}) {
  return (
    <ContentDetailSection heading={section.title} headingId={TRAITS_HEADING_ID}>
      <ul className="space-y-4" role="list">
        {section.items.map((item) => (
          <li key={item.id}>
            <ContentDetailSectionItem
              id={contentDetailNavItemId('trait', item.id)}
              label={item.title}
            >
              <TraitItemBody item={item} />
            </ContentDetailSectionItem>
          </li>
        ))}
      </ul>
    </ContentDetailSection>
  )
}

function HeritageSection({
  section,
}: {
  section: Extract<SpeciesDetailViewModel['sections'][number], { id: 'heritage' }>
}) {
  const headingId = `heritage-${section.heritageId}-heading`

  return (
    <ContentDetailSection heading={section.title} headingId={headingId}>
      {section.descriptionHtml ? (
        <RichTextContent html={section.descriptionHtml} size="md" tone="muted" className="mb-4" />
      ) : null}
      <ul className="space-y-4" role="list">
        {section.items.map((item) => (
          <li key={item.id}>
            <ContentDetailSectionItem
              id={contentDetailNavItemId('heritage-trait', item.id)}
              label={item.title}
            >
              <TraitItemBody item={item} />
            </ContentDetailSectionItem>
          </li>
        ))}
      </ul>
    </ContentDetailSection>
  )
}

function SpeciesDetailSections({ sections }: { sections: SpeciesDetailViewModel['sections'] }) {
  return (
    <>
      {sections.map((section) =>
        section.id === 'traits' ? (
          <TraitsSection key={section.id} section={section} />
        ) : (
          <HeritageSection key={`${section.id}-${section.heritageId}`} section={section} />
        ),
      )}
    </>
  )
}

export type SpeciesDetailBodyProps = {
  name: string
  nameBadge?: ReactNode
  displayImage?: ContentDisplayImage
  displayFallback?: ContentDisplayFallback
  imageName: string
  viewModel: SpeciesDetailViewModel
  campaignId: string
  editHref?: string
  children?: ReactNode
}

/** View-model-driven species detail composition — no route chrome or usage section. */
export function SpeciesDetailBody({
  name,
  nameBadge,
  displayImage,
  displayFallback,
  imageName,
  viewModel,
  campaignId,
  editHref,
  children,
}: SpeciesDetailBodyProps) {
  return (
    <ContentDetailLayout
      contentTypeKey="species"
      name={name}
      nameBadge={nameBadge}
      displayImage={displayImage}
      displayFallback={displayFallback}
      imageName={imageName}
      campaignId={campaignId}
      editHref={editHref}
      statRows={viewModel.statRows}
      heroDescription={false}
      descriptionContent={
        viewModel.descriptionHtml ? (
          <RichTextContent html={viewModel.descriptionHtml} size="md" tone="muted" />
        ) : undefined
      }
    >
      <SpeciesDetailSections sections={viewModel.sections} />
      {children}
    </ContentDetailLayout>
  )
}
