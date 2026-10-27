import type { ReactNode } from 'react'
import { RichTextContent } from '@rpg/ui'
import type { ContentDisplayFallback, ContentDisplayImage } from '@rpg/contracts'

import { DetailNavFlushStack } from '../../../lib/detail/collection/item-stack/detail-nav-flush-stack'
import { ContentDetailLayout } from '../../../lib/detail/page/content-detail-layout'
import { contentDetailProseProps } from '../../../lib/detail/page/content-detail-prose'
import { ContentDetailSection } from '../../../lib/detail/page/content-detail-section'
import { contentDetailSectionProseBodyFlushFollowClasses } from '../../../lib/detail/page/content-detail-section.variants'
import type { SpeciesDetailItem, SpeciesDetailViewModel } from '../../lib/species-display'

const TRAITS_HEADING_ID = 'traits-heading'

function TraitItemBody({ item }: { item: SpeciesDetailItem }) {
  return (
    <>
      {item.bodyHtml ? <RichTextContent html={item.bodyHtml} {...contentDetailProseProps} /> : null}
    </>
  )
}

function TraitsSection({
  section,
}: {
  section: Extract<SpeciesDetailViewModel['sections'][number], { id: 'traits' }>
}) {
  return (
    <ContentDetailSection heading={section.title} headingId={TRAITS_HEADING_ID} bodyLayout="flush">
      <DetailNavFlushStack
        navPrefix="trait"
        items={section.items}
        getLabel={(item) => item.title}
        renderItem={(item) => <TraitItemBody item={item} />}
      />
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
    <ContentDetailSection heading={section.title} headingId={headingId} bodyLayout="flush">
      {section.descriptionHtml ? (
        <div className={contentDetailSectionProseBodyFlushFollowClasses}>
          <RichTextContent html={section.descriptionHtml} {...contentDetailProseProps} />
        </div>
      ) : null}
      <DetailNavFlushStack
        navPrefix="heritage-trait"
        items={section.items}
        getLabel={(item) => item.title}
        renderItem={(item) => <TraitItemBody item={item} />}
      />
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
          <RichTextContent html={viewModel.descriptionHtml} {...contentDetailProseProps} />
        ) : undefined
      }
    >
      <SpeciesDetailSections sections={viewModel.sections} />
      {children}
    </ContentDetailLayout>
  )
}
