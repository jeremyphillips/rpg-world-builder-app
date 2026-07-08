'use client'

import { useMemo, useState } from 'react'

import {
  resolveAvailableContent,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterBuildValidationIssue,
} from '@rpg/contracts'
import { Badge, BuilderOptionDetailsSheet, Button, RadioCard, Text } from '@rpg/ui'

import {
  buildSpeciesDetailsSheetContent,
  formatSpeciesCardOption,
} from '../../lib/builder-option-display.lib'
import { BuilderStepFrame } from './builder-step-frame.client'

const SELECT_SPECIES_ACTION_LABEL = 'Select species'
const SELECTED_SPECIES_LABEL = 'Selected'

export type SpeciesStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}

export function SpeciesStep({ context, draft, validationIssues, onDraftChange }: SpeciesStepProps) {
  const [detailsSpeciesId, setDetailsSpeciesId] = useState<string | null>(null)

  const species = useMemo(() => resolveAvailableContent(context).species, [context])

  const options = useMemo(
    () =>
      species.map((entry) => ({
        value: entry.id,
        ...formatSpeciesCardOption(entry),
        onDetails: () => setDetailsSpeciesId(entry.id),
      })),
    [species],
  )

  const detailsSpecies = useMemo(
    () => species.find((entry) => entry.id === detailsSpeciesId) ?? null,
    [detailsSpeciesId, species],
  )

  const detailsContent = useMemo(() => {
    if (!detailsSpecies) return null
    return buildSpeciesDetailsSheetContent(detailsSpecies, context.catalog.languages)
  }, [context.catalog.languages, detailsSpecies])

  const isDetailsSpeciesSelected =
    detailsSpeciesId != null && draft.species.speciesId === detailsSpeciesId

  if (options.length === 0) {
    return (
      <BuilderStepFrame stepId="species" validationIssues={validationIssues}>
        <Text variant="muted">No species are available for this ruleset.</Text>
      </BuilderStepFrame>
    )
  }

  return (
    <BuilderStepFrame stepId="species" validationIssues={validationIssues}>
      <RadioCard
        density="compact"
        value={draft.species.speciesId ?? ''}
        onValueChange={(speciesId) => {
          onDraftChange({
            species: {
              ...draft.species,
              speciesId: speciesId || undefined,
            },
          })
        }}
        options={options}
        idPrefix="character-builder-species"
      />

      {detailsContent ? (
        <BuilderOptionDetailsSheet
          open={detailsSpeciesId != null}
          onOpenChange={(open) => {
            if (!open) setDetailsSpeciesId(null)
          }}
          title={detailsContent.title}
          eyebrow={detailsContent.eyebrow}
          descriptionHtml={detailsContent.descriptionHtml}
          metadata={detailsContent.metadata}
          sections={detailsContent.sections}
          primaryAction={
            isDetailsSpeciesSelected ? (
              <Badge variant="secondary">{SELECTED_SPECIES_LABEL}</Badge>
            ) : (
              <Button
                onClick={() => {
                  if (!detailsSpeciesId) return
                  onDraftChange({
                    species: {
                      ...draft.species,
                      speciesId: detailsSpeciesId,
                    },
                  })
                  setDetailsSpeciesId(null)
                }}
              >
                {SELECT_SPECIES_ACTION_LABEL}
              </Button>
            )
          }
        />
      ) : null}
    </BuilderStepFrame>
  )
}
