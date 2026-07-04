'use client'

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  CharacterBuildFinalizationError,
  finalizeCharacterBuild,
  getErrorMessage,
  type CharacterBuildCatalogIndex,
  type CharacterBuilderDraft,
  type CharacterBuildValidationIssue,
  type StandaloneBuildContext,
} from '@rpg/contracts'
import { buttonVariants, Heading, Spinner, Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

import { useCharacterPreview } from '../hooks/use-character-preview'
import { useCharacterBuilderStore } from '../hooks/use-character-builder-store'
import { useCreateCharacter } from '../hooks/use-create-character'
import {
  appendTouchedStepId,
  getAdjacentBuilderStepId,
  isReviewBuilderStep,
  resolveCurrentStepId,
} from '../lib/character-builder-navigation'
import { mergeCharacterBuilderDraft } from '../lib/merge-character-builder-draft'
import { getBuilderStepFormId } from '../lib/steps/builder-step-form-ids'
import {
  issuesForStep,
  validateBuilderFinalSubmit,
  validateBuilderStepSubmit,
} from '../lib/validate-builder-step'
import { CharacterBuilderDraftRestore } from './character-builder-draft-restore.client'
import { CharacterBuilderFooter } from './character-builder-footer.client'
import { CharacterBuilderPreviewPanel } from './character-builder-preview-panel.client'
import {
  characterBuilderShellGridClasses,
  characterBuilderShellHeaderClasses,
  characterBuilderShellRootClasses,
} from './character-builder-shell.variants'
import { CharacterBuilderStepContent } from './character-builder-step-content.client'
import { CharacterBuilderStepRail } from './character-builder-step-rail.client'

export type CharacterBuilderShellProps = {
  context: StandaloneBuildContext
  catalogIndex: CharacterBuildCatalogIndex
}

/** Full-viewport builder chrome: step rail, step panel, live preview, footer nav. */
export function CharacterBuilderShell({ context, catalogIndex }: CharacterBuilderShellProps) {
  const navigate = useNavigate()
  const { mutateAsync: createCharacterMutation, isPending: isCreating } = useCreateCharacter()
  const hasHydrated = useCharacterBuilderStore(context, (state) => state._hasHydrated)
  const draft = useCharacterBuilderStore(context, (state) => state.draft)
  const patchDraft = useCharacterBuilderStore(context, (state) => state.patchDraft)
  const clearPersistedDraft = useCharacterBuilderStore(
    context,
    (state) => state.clearPersistedDraft,
  )
  const [validationIssues, setValidationIssues] = useState<CharacterBuildValidationIssue[]>([])
  const [createError, setCreateError] = useState<string | null>(null)

  const preview = useCharacterPreview(draft, catalogIndex, context.characterCreationRules)

  if (!hasHydrated) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Spinner />
      </div>
    )
  }

  const currentStepId = resolveCurrentStepId(draft.currentStepId)
  const resolvedChoiceSets = null
  const onReview = isReviewBuilderStep(currentStepId)
  const stepValidationIssues = onReview
    ? validationIssues
    : issuesForStep(validationIssues, currentStepId)

  const navigateToStep = (stepId: typeof currentStepId) => {
    setValidationIssues([])
    patchDraft({
      currentStepId: stepId,
      touchedStepIds: appendTouchedStepId(draft.touchedStepIds, stepId),
    })
  }

  const shiftStep = (direction: 'back' | 'forward') => {
    const nextStepId = getAdjacentBuilderStepId(currentStepId, direction)
    if (!nextStepId) return
    navigateToStep(nextStepId)
  }

  const applyDraftPatch = (patch: Partial<CharacterBuilderDraft>) => {
    patchDraft(patch)
  }

  const attemptStepAdvance = (patch?: Partial<CharacterBuilderDraft>) => {
    const nextDraft = patch ? mergeCharacterBuilderDraft(draft, patch) : draft
    if (patch) patchDraft(patch)

    const result = validateBuilderStepSubmit(nextDraft, context, currentStepId)
    if (!result.ok) {
      setValidationIssues(result.issues)
      return
    }

    setValidationIssues([])
    setCreateError(null)
    shiftStep('forward')
  }

  const handleCreateCharacter = async () => {
    setValidationIssues([])
    setCreateError(null)

    const validation = validateBuilderFinalSubmit(draft, context)
    if (!validation.ok) {
      setValidationIssues(validation.issues)
      return
    }

    try {
      const input = finalizeCharacterBuild(draft, context)
      const character = await createCharacterMutation(input)
      await clearPersistedDraft()
      navigate(ROUTES.characters.detail(character.id))
    } catch (error) {
      if (error instanceof CharacterBuildFinalizationError) {
        setValidationIssues(error.validationIssues)
        return
      }

      setCreateError(getErrorMessage(error, 'Could not create character.'))
    }
  }

  return (
    <>
      <CharacterBuilderDraftRestore context={context} />

      <div className={characterBuilderShellRootClasses}>
        <header className={characterBuilderShellHeaderClasses}>
          <Heading variant="page" as="h1">
            New character
          </Heading>
          <Link to={ROUTES.characters.list} className={buttonVariants({ variant: 'outline' })}>
            Exit
          </Link>
        </header>

        <div className={characterBuilderShellGridClasses}>
          <CharacterBuilderStepRail
            draft={draft}
            currentStepId={currentStepId}
            resolvedChoiceSets={resolvedChoiceSets}
            onStepSelect={navigateToStep}
          />
          <CharacterBuilderStepContent
            stepId={currentStepId}
            context={context}
            draft={draft}
            preview={preview}
            validationIssues={stepValidationIssues}
            onDraftChange={applyDraftPatch}
            onStepComplete={attemptStepAdvance}
          />
          <CharacterBuilderPreviewPanel preview={preview} />
        </div>

        {isReviewBuilderStep(currentStepId) && createError ? (
          <Text variant="destructive" role="alert">
            {createError}
          </Text>
        ) : null}

        <CharacterBuilderFooter
          currentStepId={currentStepId}
          continueFormId={getBuilderStepFormId(currentStepId)}
          isCreating={isCreating}
          onBack={() => shiftStep('back')}
          onContinue={() => attemptStepAdvance()}
          onCreateCharacter={() => {
            void handleCreateCharacter()
          }}
        />
      </div>
    </>
  )
}
