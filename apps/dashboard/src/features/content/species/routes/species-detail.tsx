import { useParams } from 'react-router-dom'
import { Heading, RichTextContent } from '@rpg/ui'
import type { Species } from '@rpg/contracts'

import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { WidePage } from '@/components/layout/wide-page'
import {
  useCreatureTypeVocabulary,
  useLanguageVocabulary,
  useSenseVocabulary,
  getLanguageLabelFromVocabulary,
  getSenseLabelFromVocabulary,
} from '@/features/homebrew'
import { getCreatureTypeLabel } from '../lib/creature-type-field-options'
import {
  buildSpeciesDetailViewModel,
  type SpeciesDetailItem,
  type SpeciesDetailViewModel,
} from '../lib/species-display'
import { useSpecies } from '../hooks/use-species'
import { ContentDetailLayout } from '../../lib/detail/content-detail-layout'
import { ContentDetailResolver } from '../../lib/detail/content-detail-resolver'
import { contentEditHref } from '../../lib/detail/content-edit-href'
import { getContentImageUrl } from '../../lib/detail/content-image-url'

// ---------------------------------------------------------------------------
// Sub-components (markup only — labels and formatting live in species-display)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Main detail component
// ---------------------------------------------------------------------------

type SpeciesDetailContentProps = { species: Species; campaignId: string }

export function SpeciesDetailContent({ species, campaignId }: SpeciesDetailContentProps) {
  useSetBreadcrumbLabel(species.name)

  const { vocabulary: creatureTypeVocabulary } = useCreatureTypeVocabulary(campaignId)
  const { vocabulary: senseVocabulary } = useSenseVocabulary(campaignId)
  const { vocabulary: languageVocabulary } = useLanguageVocabulary(campaignId)

  const viewModel = buildSpeciesDetailViewModel(species, {
    resolveCreatureTypeLabel: (id) => getCreatureTypeLabel(id, { creatureTypeVocabulary }),
    resolveLanguageLabel: (id) => getLanguageLabelFromVocabulary(languageVocabulary, id),
    resolveSenseLabel: (type) => getSenseLabelFromVocabulary(senseVocabulary, type),
    resolveSpell: () => undefined,
  })

  return (
    <WidePage>
      <ContentDetailLayout
        name={species.name}
        imageUrl={getContentImageUrl(species.imageKey)}
        imageName={species.name}
        campaignId={campaignId}
        editHref={contentEditHref('species', campaignId, species.id)}
        statRows={viewModel.statRows}
        descriptionContent={
          viewModel.descriptionHtml ? (
            <RichTextContent html={viewModel.descriptionHtml} size="md" tone="muted" />
          ) : undefined
        }
      >
        <SpeciesDetailSections sections={viewModel.sections} />
      </ContentDetailLayout>
    </WidePage>
  )
}

export function SpeciesDetail() {
  const { campaignId = '', speciesId = '' } = useParams<{
    campaignId: string
    speciesId: string
  }>()
  const { data: species = [], isPending, isError } = useSpecies(campaignId)

  return (
    <ContentDetailResolver
      isPending={isPending}
      isError={isError}
      items={species}
      itemId={speciesId}
      loadErrorLabel="Could not load species."
      notFoundLabel="Species not found."
    >
      {(item) => <SpeciesDetailContent species={item} campaignId={campaignId} />}
    </ContentDetailResolver>
  )
}
