import type { ReactNode } from 'react'
import { Heading, RichTextContent } from '@rpg/ui'

import { ContentDetailLayout } from '../../../lib/detail/page/content-detail-layout'
import type { SpeciesDetailItem, SpeciesDetailViewModel } from '../../lib/species-display'

function TraitItem({ item }: { item: SpeciesDetailItem }) {
  return (
    <li className="space-y-1">
      <Heading variant="subsection" as="h3">
        {item.title}
      </Heading>
      {item.bodyHtml && <RichTextContent html={item.bodyHtml} size="md" tone="muted" />}
    </li>
  )
}

function TraitsSection({
  section,
}: {
  section: Extract<SpeciesDetailViewModel['sections'][number], { id: 'traits' }>
}) {
  return (
    <section aria-labelledby="traits-heading">
      <Heading variant="section" as="h2" id="traits-heading" className="mb-4">
        {section.title}
      </Heading>
      <ul className="space-y-4" role="list">
        {section.items.map((item) => (
          <TraitItem key={item.id} item={item} />
        ))}
      </ul>
    </section>
  )
}

function HeritageSection({
  section,
}: {
  section: Extract<SpeciesDetailViewModel['sections'][number], { id: 'heritage' }>
}) {
  return (
    <section aria-labelledby={`heritage-${section.heritageId}-heading`}>
      <Heading
        variant="section"
        as="h2"
        id={`heritage-${section.heritageId}-heading`}
        className="mb-2 capitalize"
      >
        {section.title}
      </Heading>
      {section.descriptionHtml && (
        <RichTextContent html={section.descriptionHtml} size="md" tone="muted" className="mb-4" />
      )}
      <ul className="space-y-4" role="list">
        {section.items.map((item) => (
          <TraitItem key={item.id} item={item} />
        ))}
      </ul>
    </section>
  )
}

function SpeciesDetailSections({ sections }: { sections: SpeciesDetailViewModel['sections'] }) {
  return (
    <>
      {sections.map((section) =>
        section.id === 'traits' ? (
          <TraitsSection key={section.id} section={section} />
        ) : (
          <HeritageSection key={section.id} section={section} />
        ),
      )}
    </>
  )
}

export type SpeciesDetailBodyProps = {
  name: string
  nameBadge?: ReactNode
  imageUrl: string
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
  imageUrl,
  imageName,
  viewModel,
  campaignId,
  editHref,
  children,
}: SpeciesDetailBodyProps) {
  return (
    <ContentDetailLayout
      name={name}
      nameBadge={nameBadge}
      imageUrl={imageUrl}
      imageName={imageName}
      campaignId={campaignId}
      editHref={editHref}
      statRows={viewModel.statRows}
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
