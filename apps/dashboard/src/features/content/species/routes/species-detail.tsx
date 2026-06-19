import { useParams } from 'react-router-dom'
import { sanitizeHtml, Spinner } from '@rpg/ui'
import { getCreatureTypeLabel, getCreatureSizeLabel, getSenseLabel } from '@rpg/contracts'
import type { Species, Speed, SpeciesTrait, SpeciesChoiceGroup } from '@rpg/contracts'

import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { useSpecies } from '../hooks/use-species'
import { ContentDetailLayout } from '../../lib/content-detail-layout'
import { ContentStatRow } from '../../lib/content-stat-row'
import { getContentImageUrl } from '../../lib/content-image-url'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EXTRA_SPEED_MODES: Array<{ key: keyof Omit<Speed, 'walk'>; label: string }> = [
  { key: 'fly', label: 'fly' },
  { key: 'swim', label: 'swim' },
  { key: 'climb', label: 'climb' },
  { key: 'burrow', label: 'burrow' },
]

function formatSpeed(speed: Speed): string {
  const extras = EXTRA_SPEED_MODES.filter(({ key }) => speed[key] !== undefined).map(
    ({ key, label }) => `${label} ${speed[key]} ft.`,
  )
  return [`${speed.walk} ft.`, ...extras].join(', ')
}

function collectSenses(traits: SpeciesTrait[]): string {
  const senses = traits.flatMap((t) => t.grants?.senses ?? [])
  if (senses.length === 0) return 'None'
  return senses.map((s) => `${getSenseLabel(s.type)} ${s.range} ft.`).join(', ')
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TraitItem({ trait }: { trait: SpeciesTrait }) {
  return (
    <li className="space-y-1">
      <p className="font-medium">{trait.name}</p>
      {trait.description && (
        <div
          className="prose prose-sm max-w-none text-muted-foreground [&>p]:my-0"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(trait.description) }}
        />
      )}
    </li>
  )
}

function TraitsList({ traits }: { traits: SpeciesTrait[] }) {
  if (traits.length === 0) return null
  return (
    <section aria-labelledby="traits-heading">
      <h3 id="traits-heading" className="mb-4 text-xl font-semibold tracking-tight">
        Traits
      </h3>
      <ul className="space-y-4" role="list">
        {traits.map((trait) => (
          <TraitItem key={trait.id} trait={trait} />
        ))}
      </ul>
    </section>
  )
}

function ChoiceGroupSection({ group }: { group: SpeciesChoiceGroup }) {
  return (
    <section aria-labelledby={`choice-group-${group.id}-heading`}>
      <h3
        id={`choice-group-${group.id}-heading`}
        className="mb-2 text-xl font-semibold tracking-tight capitalize"
      >
        {group.name}
      </h3>
      {group.description && (
        <div
          className="prose prose-sm mb-4 max-w-none text-muted-foreground [&>p]:my-0"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(group.description) }}
        />
      )}
      <ul className="space-y-4" role="list">
        {group.options.map((option) => (
          <li key={option.id} className="space-y-1">
            <p className="font-medium">{option.name}</p>
            {option.description && (
              <div
                className="prose prose-sm max-w-none text-muted-foreground [&>p]:my-0"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(option.description) }}
              />
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

function ChoiceGroupsList({ groups }: { groups: SpeciesChoiceGroup[] }) {
  if (groups.length === 0) return null
  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <ChoiceGroupSection key={group.id} group={group} />
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

type SpeciesDetailContentProps = { species: Species }

function SpeciesDetailContent({ species }: SpeciesDetailContentProps) {
  useSetBreadcrumbLabel(species.name)

  return (
    <ContentDetailLayout imageUrl={getContentImageUrl(species.imageKey)} imageName={species.name}>
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">{species.name}</h2>
        <SpeciesStatsSection species={species} />
        {species.description && <p className="text-muted-foreground">{species.description}</p>}
      </div>
      <TraitsList traits={species.traits} />
      <ChoiceGroupsList groups={species.choiceGroups ?? []} />
    </ContentDetailLayout>
  )
}

function findById(list: Species[], id: string): Species | undefined {
  return list.find((s) => s.id === id)
}

export function SpeciesDetail() {
  const { campaignId = '', speciesId = '' } = useParams<{
    campaignId: string
    speciesId: string
  }>()
  const { data: species = [], isPending, isError } = useSpecies(campaignId)

  if (isPending) {
    return <Spinner />
  }

  if (isError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        Could not load species.
      </p>
    )
  }

  const item = findById(species, speciesId)

  if (!item) {
    return (
      <p role="alert" className="text-sm text-destructive">
        Species not found.
      </p>
    )
  }

  return <SpeciesDetailContent species={item} />
}
