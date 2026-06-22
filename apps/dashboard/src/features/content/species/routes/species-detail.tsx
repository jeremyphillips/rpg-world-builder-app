import { useParams } from 'react-router-dom'
import { Heading, RichTextContent } from '@rpg/ui'
import {
  formatSpeed,
  getCreatureTypeLabel,
  getCreatureSizeLabel,
  getSenseLabel,
  getTraitGrants,
  resolveTraitDisplay,
} from '@rpg/contracts'
import type { Species, SpeciesTrait, SpeciesHeritageChoice } from '@rpg/contracts'

import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { useSpecies } from '../hooks/use-species'
import { ContentDetailLayout } from '../../lib/content-detail-layout'
import { ContentDetailResolver } from '../../lib/content-detail-resolver'
import { contentEditHref } from '../../lib/content-edit-href'
import { ContentStatRow } from '../../lib/content-stat-row'
import { getContentImageUrl } from '../../lib/content-image-url'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function collectSenses(traits: SpeciesTrait[]): string {
  const senses = traits.flatMap((t) => getTraitGrants(t)?.senses ?? [])
  if (senses.length === 0) return 'None'
  return senses.map((s) => `${getSenseLabel(s.type)} ${s.range} ft.`).join(', ')
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TraitItem({ trait }: { trait: SpeciesTrait }) {
  const display = resolveTraitDisplay(trait)
  return (
    <li className="space-y-1">
      <Heading variant="label" as="p">
        {display.name}
      </Heading>
      {display.descriptionHtml && (
        <RichTextContent html={display.descriptionHtml} size="sm" tone="muted" />
      )}
    </li>
  )
}

function TraitsList({ traits }: { traits: SpeciesTrait[] }) {
  if (traits.length === 0) return null
  return (
    <section aria-labelledby="traits-heading">
      <Heading variant="section" as="h3" id="traits-heading" className="mb-4">
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

function HeritageChoiceSection({ choice }: { choice: SpeciesHeritageChoice }) {
  return (
    <section aria-labelledby={`heritage-choice-${choice.id}-heading`}>
      <Heading
        variant="section"
        as="h3"
        id={`heritage-choice-${choice.id}-heading`}
        className="mb-2 capitalize"
      >
        {choice.name}
      </Heading>
      {choice.description && (
        <RichTextContent html={choice.description} size="sm" tone="muted" className="mb-4" />
      )}
      <ul className="space-y-4" role="list">
        {choice.options.map((option) => {
          const display = resolveTraitDisplay(option)
          return (
            <li key={option.id} className="space-y-1">
              <Heading variant="label" as="p">
                {display.name}
              </Heading>
              {display.descriptionHtml && (
                <RichTextContent html={display.descriptionHtml} size="sm" tone="muted" />
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function HeritageChoicesList({ choices }: { choices: SpeciesHeritageChoice[] }) {
  if (choices.length === 0) return null
  return (
    <div className="space-y-8">
      {choices.map((choice) => (
        <HeritageChoiceSection key={choice.id} choice={choice} />
      ))}
    </div>
  )
}

function SpeciesStatsSection({ species }: { species: Species }) {
  const sizeLabel = species.sizes.map(getCreatureSizeLabel).join(' or ')
  const sensesLabel = collectSenses(species.traits)

  return (
    <div className="space-y-3">
      <ContentStatRow label="Creature Type" value={getCreatureTypeLabel(species.creatureType)} />
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
    <ContentDetailLayout
      imageUrl={getContentImageUrl(species.imageKey)}
      imageName={species.name}
      campaignId={campaignId}
      editHref={contentEditHref('species', campaignId, species.id)}
    >
      <div className="space-y-4">
        <Heading variant="display" as="h2">
          {species.name}
        </Heading>
        <SpeciesStatsSection species={species} />
        {species.description && (
          <RichTextContent html={species.description} size="sm" tone="muted" />
        )}
      </div>
      <TraitsList traits={species.traits} />
      <HeritageChoicesList choices={species.heritageChoices ?? []} />
    </ContentDetailLayout>
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
