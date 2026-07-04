'use client'

import { useMemo } from 'react'

import {
  resolveAvailableContent,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterBuildValidationIssue,
} from '@rpg/contracts'
import { RadioCard, Text } from '@rpg/ui'

import { BuilderStepFrame } from './builder-step-frame.client'

export type SpeciesStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}

export function SpeciesStep({ context, draft, validationIssues, onDraftChange }: SpeciesStepProps) {
  const options = useMemo(() => {
    const { species } = resolveAvailableContent(context)
    return species.map((entry) => ({
      value: entry.id,
      label: entry.name,
      description: entry.creatureType,
    }))
  }, [context])

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
    </BuilderStepFrame>
  )
}
