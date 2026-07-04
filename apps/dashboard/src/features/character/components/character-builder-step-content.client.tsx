'use client'

import type {
  CharacterBuildContext,
  CharacterBuilderDraft,
  CharacterBuilderStepId,
  CharacterBuildPreview,
  CharacterBuildValidationIssue,
} from '@rpg/contracts'

import { CharacterBuilderStepPanel } from './character-builder-step-panel.client'
import { AbilitiesStep } from './steps/abilities-step.client'
import { ClassStep } from './steps/class-step.client'
import { IdentityStep } from './steps/identity-step.client'
import { ReviewStep } from './steps/review-step.client'
import { SpeciesStep } from './steps/species-step.client'

export type CharacterBuilderStepContentProps = {
  stepId: CharacterBuilderStepId
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  preview: CharacterBuildPreview | null
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
  onStepComplete: (patch?: Partial<CharacterBuilderDraft>) => void
}

export function CharacterBuilderStepContent({
  stepId,
  context,
  draft,
  preview,
  validationIssues,
  onDraftChange,
  onStepComplete,
}: CharacterBuilderStepContentProps) {
  switch (stepId) {
    case 'identity':
      return (
        <IdentityStep
          draft={draft}
          validationIssues={validationIssues}
          onDraftChange={onDraftChange}
          onStepComplete={onStepComplete}
        />
      )
    case 'species':
      return (
        <SpeciesStep
          context={context}
          draft={draft}
          validationIssues={validationIssues}
          onDraftChange={onDraftChange}
        />
      )
    case 'class':
      return (
        <ClassStep
          context={context}
          draft={draft}
          validationIssues={validationIssues}
          onDraftChange={onDraftChange}
        />
      )
    case 'abilities':
      return (
        <AbilitiesStep
          draft={draft}
          validationIssues={validationIssues}
          onStepComplete={onStepComplete}
        />
      )
    case 'review':
      return (
        <ReviewStep
          context={context}
          draft={draft}
          preview={preview}
          validationIssues={validationIssues}
        />
      )
    case 'proficiencies':
    case 'equipment':
    case 'spells':
      return <CharacterBuilderStepPanel stepId={stepId} status="deferred" />
    default:
      return null
  }
}
