import { useParams } from 'react-router-dom'
import { Heading, RichTextContent, Text } from '@rpg/ui'
import {
  flattenGrantGroups,
  formatSpeed,
  getCreatureSizeLabel,
  resolveGrantGroupsFromContent,
  resolveTraitDisplay,
} from '@rpg/contracts'
import type { Species, SpeciesTrait, SpeciesHeritage } from '@rpg/contracts'

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
import { useSpecies } from '../hooks/use-species'
import { ContentDetailLayout } from '../../lib/detail/content-detail-layout'
import { ContentDetailResolver } from '../../lib/detail/content-detail-resolver'
import { contentEditHref } from '../../lib/detail/content-edit-href'
import { ContentStatRow } from '../../lib/detail/content-stat-row.client'
import { getContentImageUrl } from '../../lib/detail/content-image-url'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function collectSenses(
  traits: SpeciesTrait[],
  senseVocabulary: ReturnType<typeof useSenseVocabulary>['vocabulary'],
): string {
  const senses = traits.flatMap((trait) =>
    flattenGrantGroups(resolveGrantGroupsFromContent(trait))
      .map(({ grant }) => grant)
      .filter((grant): grant is Extract<typeof grant, { kind: 'sense' }> => grant.kind === 'sense'),
  )
  if (senses.length === 0) return 'None'
  return senses
    .map((s) => `${getSenseLabelFromVocabulary(senseVocabulary, s.type)} ${s.range} ft.`)
    .join(', ')
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TraitItem({ trait }: { trait: SpeciesTrait }) {
  const display = resolveTraitDisplay(trait)
  return (
    <li className="space-y-1">
      <Heading variant="subsection" as="h3">
        {display.name}
      </Heading>
      {display.descriptionHtml && (
        <RichTextContent html={display.descriptionHtml} size="md" tone="muted" />
      )}
    </li>
  )
}

function LanguageAffinitiesSection({
  languageAffinities,
  campaignId,
}: {
  languageAffinities: Species['languageAffinities']
  campaignId: string
}) {
  const { vocabulary } = useLanguageVocabulary(campaignId)
  if (!languageAffinities?.length) return null

  const labels = languageAffinities
    .map((id) => getLanguageLabelFromVocabulary(vocabulary, id))
    .join(', ')

  return (
    <section aria-labelledby="language-affinities-heading">
      <Heading variant="section" as="h2" id="language-affinities-heading" className="mb-4">
        Language affinities
      </Heading>
      <Text variant="muted">{labels}</Text>
    </section>
  )
}

function TraitsList({ traits }: { traits: SpeciesTrait[] }) {
  if (traits.length === 0) return null
  return (
    <section aria-labelledby="traits-heading">
      <Heading variant="section" as="h2" id="traits-heading" className="mb-4">
        Traits
      </Heading>
      <ul className="space-y-4" role="list">
        {traits.map((trait) => (
          <TraitItem key={trait.id} trait={trait} />
        ))}
      </ul>
    </section>
  )
}

function HeritageSection({ heritage }: { heritage: SpeciesHeritage }) {
  return (
    <section aria-labelledby={`heritage-${heritage.id}-heading`}>
      <Heading
        variant="section"
        as="h2"
        id={`heritage-${heritage.id}-heading`}
        className="mb-2 capitalize"
      >
        {heritage.name}
      </Heading>
      {heritage.description && (
        <RichTextContent html={heritage.description} size="md" tone="muted" className="mb-4" />
      )}
      <ul className="space-y-4" role="list">
        {heritage.options.map((option) => {
          const display = resolveTraitDisplay(option)
          return (
            <li key={option.id} className="space-y-1">
              <Heading variant="subsection" as="h3">
                {display.name}
              </Heading>
              {display.descriptionHtml && (
                <RichTextContent html={display.descriptionHtml} size="md" tone="muted" />
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function SpeciesStatsSection({ species, campaignId }: { species: Species; campaignId: string }) {
  const { vocabulary } = useCreatureTypeVocabulary(campaignId)
  const { vocabulary: senseVocabulary } = useSenseVocabulary(campaignId)
  const sizeLabel = species.sizes.map(getCreatureSizeLabel).join(' or ')
  const sensesLabel = collectSenses(species.traits, senseVocabulary)

  return (
    <div className="space-y-3">
      <ContentStatRow
        label="Creature Type"
        value={getCreatureTypeLabel(species.creatureType, { creatureTypeVocabulary: vocabulary })}
      />
      <ContentStatRow label="Size" value={sizeLabel} />
      <ContentStatRow label="Speed" value={formatSpeed(species.speed)} />
      <ContentStatRow label="Senses" value={sensesLabel} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main detail component
// ---------------------------------------------------------------------------

type SpeciesDetailContentProps = { species: Species; campaignId: string }

export function SpeciesDetailContent({ species, campaignId }: SpeciesDetailContentProps) {
  useSetBreadcrumbLabel(species.name)

  return (
    <WidePage>
      <ContentDetailLayout
        name={species.name}
        imageUrl={getContentImageUrl(species.imageKey)}
        imageName={species.name}
        campaignId={campaignId}
        editHref={contentEditHref('species', campaignId, species.id)}
        metadata={<SpeciesStatsSection species={species} campaignId={campaignId} />}
        descriptionContent={
          species.description ? (
            <RichTextContent html={species.description} size="md" tone="muted" />
          ) : undefined
        }
      >
        <LanguageAffinitiesSection
          languageAffinities={species.languageAffinities}
          campaignId={campaignId}
        />
        <TraitsList traits={species.traits} />
        {species.heritage ? <HeritageSection heritage={species.heritage} /> : null}
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
