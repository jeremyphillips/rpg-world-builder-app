'use client'

import { useCallback, useMemo, useState } from 'react'

import {
  resolveAvailableContent,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterBuildValidationIssue,
  type ChoiceSet,
} from '@rpg/contracts'
import { AttentionFrame, Badge, BuilderOptionDetailsSheet, Button, RadioCard, Text } from '@rpg/ui'

import {
  findSpeciesHeritageChoiceSet,
  mapHeritageOptionsToDependentCardOptions,
  resolveDependentChoiceSectionCopy,
} from '../../lib/builder-dependent-choice.lib'
import {
  buildSpeciesDetailsSheetContent,
  formatSpeciesCardOption,
} from '../../lib/builder-option-display.lib'
import {
  DEPENDENT_KIND_HERITAGE,
  formatParentChoiceTitleMeta,
  MANAGE_HERITAGE_LABEL,
} from '../../lib/builder-parent-choice-status.lib'
import {
  buildHeritageSelectionPatch,
  buildSpeciesSelectionPatch,
} from '../../lib/species-selection.lib'
import { BuilderDependentChoiceSection } from '../builder-dependent-choice-section.client'
import { BuilderStepFrame } from './builder-step-frame.client'

const SELECT_SPECIES_ACTION_LABEL = 'Select species'
const SELECTED_SPECIES_LABEL = 'Selected'
const HERITAGE_SECTION_ID_PREFIX = 'character-builder-species-heritage'

export type SpeciesStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  resolvedChoiceSets: readonly ChoiceSet[]
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}

function resolveSelectedHeritageOptionId(
  draft: CharacterBuilderDraft,
  heritageChoiceSet: ChoiceSet | undefined,
): string | undefined {
  if (draft.species.heritageId) return draft.species.heritageId
  if (!heritageChoiceSet) return undefined
  return draft.choiceSelections[heritageChoiceSet.id]?.[0]
}

export function SpeciesStep({
  context,
  draft,
  resolvedChoiceSets,
  validationIssues,
  onDraftChange,
}: SpeciesStepProps) {
  const [detailsSpeciesId, setDetailsSpeciesId] = useState<string | null>(null)
  const [attentionActive, setAttentionActive] = useState(false)

  const species = useMemo(() => resolveAvailableContent(context).species, [context])

  const selectedSpeciesId = draft.species.speciesId
  const selectedSpecies = useMemo(
    () => species.find((entry) => entry.id === selectedSpeciesId) ?? null,
    [selectedSpeciesId, species],
  )

  const heritageChoiceSet = useMemo(() => {
    if (!selectedSpeciesId) return undefined
    return findSpeciesHeritageChoiceSet(resolvedChoiceSets, selectedSpeciesId)
  }, [resolvedChoiceSets, selectedSpeciesId])

  const selectedHeritageOptionId = useMemo(
    () => resolveSelectedHeritageOptionId(draft, heritageChoiceSet),
    [draft, heritageChoiceSet],
  )

  const selectedHeritageOptionLabel = useMemo(() => {
    if (!selectedHeritageOptionId || !heritageChoiceSet) return undefined
    return heritageChoiceSet.options.find((option) => option.id === selectedHeritageOptionId)?.label
  }, [heritageChoiceSet, selectedHeritageOptionId])

  const heritageUnresolved = heritageChoiceSet != null && !selectedHeritageOptionId

  const handleSpeciesSelect = useCallback(
    (speciesId: string) => {
      const nextSpecies = species.find((entry) => entry.id === speciesId)
      onDraftChange(buildSpeciesSelectionPatch(draft, speciesId))
      if (nextSpecies?.heritage) {
        setAttentionActive(true)
      }
    },
    [draft, onDraftChange, species],
  )

  const heritageSectionCopy = useMemo(
    () =>
      resolveDependentChoiceSectionCopy({
        required: heritageUnresolved,
        selectedOptionLabel: selectedHeritageOptionLabel,
      }),
    [heritageUnresolved, selectedHeritageOptionLabel],
  )

  const heritageEmbeddedContent = useMemo(() => {
    if (!heritageChoiceSet || !selectedSpecies) return null

    return (
      <AttentionFrame
        active={attentionActive}
        onAttentionComplete={() => setAttentionActive(false)}
      >
        <BuilderDependentChoiceSection
          embedded
          idPrefix={HERITAGE_SECTION_ID_PREFIX}
          title={heritageChoiceSet.label}
          sectionCopy={heritageSectionCopy}
          dependentKindLabel={DEPENDENT_KIND_HERITAGE}
          options={mapHeritageOptionsToDependentCardOptions(
            selectedSpecies,
            context.catalog.languages,
            context.catalog.spells,
          )}
          value={selectedHeritageOptionId ?? ''}
          onValueChange={(optionId) => {
            onDraftChange(buildHeritageSelectionPatch(draft, heritageChoiceSet.id, optionId))
          }}
        />
      </AttentionFrame>
    )
  }, [
    attentionActive,
    context.catalog.languages,
    context.catalog.spells,
    draft,
    heritageChoiceSet,
    heritageSectionCopy,
    onDraftChange,
    selectedHeritageOptionId,
    selectedSpecies,
  ])

  const options = useMemo(
    () =>
      species.map((entry) => {
        const card = formatSpeciesCardOption(entry)
        const isSelected = selectedSpeciesId === entry.id

        let titleMeta: string | undefined
        if (isSelected && entry.heritage) {
          titleMeta = formatParentChoiceTitleMeta({
            dependentKindLabel: DEPENDENT_KIND_HERITAGE,
            required: !selectedHeritageOptionId,
            selectedOptionLabel: selectedHeritageOptionLabel,
          })
        }

        return {
          value: entry.id,
          ...card,
          ...(titleMeta ? { titleMeta } : {}),
          ...(isSelected && entry.heritage && heritageEmbeddedContent
            ? { embeddedContent: heritageEmbeddedContent }
            : {}),
          onDetails: () => setDetailsSpeciesId(entry.id),
        }
      }),
    [
      heritageEmbeddedContent,
      selectedHeritageOptionId,
      selectedHeritageOptionLabel,
      selectedSpeciesId,
      species,
    ],
  )

  const detailsSpecies = useMemo(
    () => species.find((entry) => entry.id === detailsSpeciesId) ?? null,
    [detailsSpeciesId, species],
  )

  const detailsContent = useMemo(() => {
    if (!detailsSpecies) return null
    return buildSpeciesDetailsSheetContent(
      detailsSpecies,
      context.catalog.languages,
      context.catalog.spells,
    )
  }, [context.catalog.languages, context.catalog.spells, detailsSpecies])

  const isDetailsSpeciesSelected =
    detailsSpeciesId != null && draft.species.speciesId === detailsSpeciesId
  const detailsSpeciesHasHeritage = detailsSpecies?.heritage != null

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
        value={selectedSpeciesId ?? ''}
        onValueChange={(speciesId) => {
          if (!speciesId) return
          handleSpeciesSelect(speciesId)
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
              detailsSpeciesHasHeritage ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{SELECTED_SPECIES_LABEL}</Badge>
                  <Button
                    type="button"
                    onClick={() => {
                      setDetailsSpeciesId(null)
                      setAttentionActive(true)
                    }}
                  >
                    {MANAGE_HERITAGE_LABEL}
                  </Button>
                </div>
              ) : (
                <Badge variant="secondary">{SELECTED_SPECIES_LABEL}</Badge>
              )
            ) : (
              <Button
                type="button"
                onClick={() => {
                  if (!detailsSpeciesId) return
                  handleSpeciesSelect(detailsSpeciesId)
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
