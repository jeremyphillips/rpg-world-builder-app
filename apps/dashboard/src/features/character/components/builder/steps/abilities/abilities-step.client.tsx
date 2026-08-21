'use client'

import { useMemo } from 'react'
import {
  deriveAbilityScoreRecommendations,
  isEffectiveBuilderStep,
  resolveAbilityGenerationMethod,
  resolveBuilderStandardArray,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
} from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'
import { Form } from '@rpg/ui/form'

import {
  abilitiesFormSchema,
  buildAbilitiesStepFormFields,
  type AbilitiesFormValues,
} from '../../../../lib/steps/abilities-form-fields'
import {
  abilitiesDraftToFormValues,
  abilitiesFormValuesToDraft,
} from '../../../../lib/steps/abilities-form-values'
import { BUILDER_STEP_FORM_IDS } from '../../../../lib/steps/builder-step-form-ids'
import { BuilderFormContinueRegistration } from '../../builder-form-continue-registration.client'
import { AbilitiesDraftSync } from './abilities-draft-sync.client'
import { BuilderStepFrame } from '../builder-step-frame.client'
import { FixedScoresAssignment } from './fixed-scores-assignment.client'
import { ManualAbilitiesAssignment } from './manual-abilities-assignment.client'

export type AbilitiesStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
  onStepComplete: (patch: Partial<CharacterBuilderDraft>) => void
  onFormContinueValidationFailed: (patch: Partial<CharacterBuilderDraft>) => void
}

export function AbilitiesStep({
  context,
  draft,
  validationIssues,
  onDraftChange,
  onStepComplete,
  onFormContinueValidationFailed,
}: AbilitiesStepProps) {
  const abilityGeneration = context.characterCreationRules.abilityGeneration
  const resolvedMethod = resolveAbilityGenerationMethod(abilityGeneration)
  const standardArray = resolveBuilderStandardArray(context, draft.class.level)
  const showInvalidStates = validationIssues.length > 0

  const characterClass = useMemo(() => {
    const classId = draft.class.classId
    if (!classId) return undefined
    return context.catalog.classes.find((entry) => entry.id === classId)
  }, [context.catalog.classes, draft.class.classId])

  const classStepApplicable = useMemo(
    () => isEffectiveBuilderStep(context, draft, 'class'),
    [context, draft],
  )

  const classInput = useMemo(() => {
    if (!characterClass) return null
    return {
      className: characterClass.name,
      primaryAbilities: characterClass.primaryAbilities,
      abilityScoreOrder: characterClass.characterCreation?.abilityScoreOrder,
    }
  }, [characterClass])

  const recommendation = useMemo(
    () =>
      classInput
        ? deriveAbilityScoreRecommendations(
            [classInput],
            resolvedMethod === 'standard-array' ? standardArray : undefined,
          )
        : null,
    [classInput, resolvedMethod, standardArray],
  )

  const fields = useMemo(
    () =>
      buildAbilitiesStepFormFields({
        method: resolvedMethod,
        renderFixedScoresAssignment: () => (
          <FixedScoresAssignment
            scorePool={standardArray}
            showInvalidStates={showInvalidStates}
            classInput={classInput}
            classStepApplicable={classStepApplicable}
            recommendation={recommendation}
          />
        ),
        renderManualAbilitiesAssignment: () => (
          <ManualAbilitiesAssignment
            showInvalidStates={showInvalidStates}
            classInput={classInput}
            classStepApplicable={classStepApplicable}
            recommendation={recommendation}
          />
        ),
        renderDraftSync: () => (
          <AbilitiesDraftSync
            context={context}
            draftAbilities={draft.abilities}
            onDraftChange={onDraftChange}
          />
        ),
        renderContinueRegistration: () => (
          <BuilderFormContinueRegistration<AbilitiesFormValues>
            stepId="abilities"
            toDraftPatch={(values) => ({
              abilities: abilitiesFormValuesToDraft(values, resolvedMethod),
            })}
            onStepComplete={onStepComplete}
            onContinueValidationFailed={onFormContinueValidationFailed}
          />
        ),
      }),
    [
      classInput,
      classStepApplicable,
      context,
      draft.abilities,
      onDraftChange,
      onFormContinueValidationFailed,
      onStepComplete,
      recommendation,
      resolvedMethod,
      showInvalidStates,
      standardArray,
    ],
  )

  return (
    <BuilderStepFrame stepId="abilities" validationIssues={validationIssues}>
      <Form
        id={BUILDER_STEP_FORM_IDS.abilities}
        schema={abilitiesFormSchema}
        fields={fields}
        defaultValues={abilitiesDraftToFormValues(draft.abilities)}
        mode="onChange"
        onSubmit={(values) => {
          onStepComplete({ abilities: abilitiesFormValuesToDraft(values, resolvedMethod) })
        }}
      />
    </BuilderStepFrame>
  )
}
