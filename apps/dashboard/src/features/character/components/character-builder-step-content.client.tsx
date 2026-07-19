'use client'

import type {
  CharacterBuildContext,
  CharacterBuilderDraft,
  CharacterBuilderStepId,
  CharacterBuildPreview,
  CharacterBuildValidationIssue,
  ChoiceSet,
} from '@rpg/contracts'
import { AbilitiesStep } from './steps/abilities-step.client'
import { ClassStep } from './steps/class-step.client'
import { IdentityStep } from './steps/identity-step.client'
import { ProficienciesStep } from './steps/proficiencies-step.client'
import { EquipmentStep } from './steps/equipment-step.client'
import { ReviewStep } from './steps/review-step.client'
import { SpeciesStep } from './steps/species-step.client'
import { SpellsStep } from './steps/spells-step.client'

export type CharacterBuilderStepContentProps = {
  stepId: CharacterBuilderStepId
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  preview: CharacterBuildPreview | null
  resolvedChoiceSets: readonly ChoiceSet[]
  validationIssues: CharacterBuildValidationIssue[]
  reviewValidationHeading: string
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
  onStepComplete: (patch?: Partial<CharacterBuilderDraft>) => void
  onFormContinueValidationFailed: (patch: Partial<CharacterBuilderDraft>) => void
  onNavigateToStep: (stepId: CharacterBuilderStepId) => void
}

export function CharacterBuilderStepContent({
  stepId,
  context,
  draft,
  preview,
  resolvedChoiceSets,
  validationIssues,
  reviewValidationHeading,
  onDraftChange,
  onStepComplete,
  onFormContinueValidationFailed,
  onNavigateToStep,
}: CharacterBuilderStepContentProps) {
  switch (stepId) {
    case 'identity':
      return (
        <IdentityStep
          draft={draft}
          validationIssues={validationIssues}
          onDraftChange={onDraftChange}
          onStepComplete={onStepComplete}
          onFormContinueValidationFailed={onFormContinueValidationFailed}
        />
      )
    case 'species':
      return (
        <SpeciesStep
          context={context}
          draft={draft}
          resolvedChoiceSets={resolvedChoiceSets}
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
          context={context}
          draft={draft}
          validationIssues={validationIssues}
          onDraftChange={onDraftChange}
          onStepComplete={onStepComplete}
          onFormContinueValidationFailed={onFormContinueValidationFailed}
        />
      )
    case 'review':
      return (
        <ReviewStep
          context={context}
          draft={draft}
          preview={preview}
          resolvedChoiceSets={resolvedChoiceSets}
          validationIssues={validationIssues}
          validationHeading={reviewValidationHeading}
          onNavigateToStep={onNavigateToStep}
        />
      )
    case 'proficiencies':
      return (
        <ProficienciesStep
          context={context}
          draft={draft}
          preview={preview}
          resolvedChoiceSets={resolvedChoiceSets}
          validationIssues={validationIssues}
          onDraftChange={onDraftChange}
        />
      )
    case 'equipment':
      return (
        <EquipmentStep
          context={context}
          draft={draft}
          resolvedChoiceSets={resolvedChoiceSets}
          validationIssues={validationIssues}
          onDraftChange={onDraftChange}
        />
      )
    case 'spells':
      return (
        <SpellsStep
          context={context}
          draft={draft}
          preview={preview}
          resolvedChoiceSets={resolvedChoiceSets}
          validationIssues={validationIssues}
          onDraftChange={onDraftChange}
        />
      )
    default:
      return null
  }
}
