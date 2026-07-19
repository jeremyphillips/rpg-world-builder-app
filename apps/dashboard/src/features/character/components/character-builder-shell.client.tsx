'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  CharacterBuildFinalizationError,
  finalizeCharacterBuild,
  getErrorMessage,
  type CharacterBuildCatalogIndex,
  type CharacterBuilderDraft,
  type CharacterBuilderStepId,
  type CharacterBuildValidationIssue,
  type StandaloneBuildContext,
} from '@rpg/contracts'
import { buttonVariants, Heading, Spinner, Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

import { useResolvedChoiceSets } from '../hooks/use-resolved-choice-sets'
import { useCharacterPreview } from '../hooks/use-character-preview'
import { useCharacterBuilderStore } from '../hooks/use-character-builder-store'
import { useCreateCharacter } from '../hooks/use-create-character'
import {
  mergeValidationVisibleStepIds,
  pruneValidationVisibleStepIds,
  removeValidationVisibleStepId,
} from '../lib/builder-validation-visible-steps.lib'
import { runBuilderFormContinueHandler } from '../lib/builder-form-continue-registry'
import { patchTouchesDraftContent } from '../lib/character-builder-draft-touch.lib'
import {
  appendAttemptedStepId,
  appendTouchedStepId,
  getAdjacentBuilderStepId,
  isReviewBuilderStep,
  mergeAttemptedStepIds,
  resolveCurrentStepId,
} from '../lib/character-builder-navigation'
import { mergeCharacterBuilderDraft } from '../lib/merge-character-builder-draft'
import {
  issuesForStep,
  resolveBuilderDraftValidationIssues,
  resolveStepValidationIssuesAfterDraftChange,
  validateBuilderFinalSubmit,
  validateBuilderStepSubmit,
} from '../lib/validate-builder-step'
import { CharacterBuilderDraftRestore } from './character-builder-draft-restore.client'
import { CharacterBuilderFooter } from './character-builder-footer.client'
import { CharacterBuilderPreviewPanel } from './character-builder-preview-panel.client'
import {
  characterBuilderShellBodyClasses,
  characterBuilderShellColumnClasses,
  characterBuilderShellHeaderClasses,
  characterBuilderShellPreviewColumnClasses,
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
  const hasPendingRestore = useCharacterBuilderStore(context, (state) => state.hasPendingRestore)
  const draft = useCharacterBuilderStore(context, (state) => state.draft)
  const patchDraft = useCharacterBuilderStore(context, (state) => state.patchDraft)
  const clearPersistedDraft = useCharacterBuilderStore(
    context,
    (state) => state.clearPersistedDraft,
  )
  const [validationIssues, setValidationIssues] = useState<CharacterBuildValidationIssue[]>([])
  const [, setAttemptedStepIds] = useState<CharacterBuilderStepId[]>([])
  const [validationVisibleStepIds, setValidationVisibleStepIds] = useState<
    CharacterBuilderStepId[]
  >([])
  const [createError, setCreateError] = useState<string | null>(null)

  const resolvedChoiceSets = useResolvedChoiceSets(draft, context)

  const currentStepId = resolveCurrentStepId(draft.currentStepId)

  const preview = useCharacterPreview(
    draft,
    catalogIndex,
    context.characterCreationRules,
    context.rulesetId,
    resolvedChoiceSets,
  )

  const applyDraftPatch = useCallback(
    (patch: Partial<CharacterBuilderDraft>) => {
      const stepId = resolveCurrentStepId(draft.currentStepId)
      const shouldTouch = patchTouchesDraftContent(patch)
      patchDraft(
        shouldTouch
          ? { ...patch, touchedStepIds: appendTouchedStepId(draft.touchedStepIds, stepId) }
          : patch,
      )
    },
    [draft.currentStepId, draft.touchedStepIds, patchDraft],
  )

  const canCreateCharacter = useMemo(
    () => validateBuilderFinalSubmit(draft, context, resolvedChoiceSets).ok,
    [context, draft, resolvedChoiceSets],
  )

  const draftValidationIssues = useMemo(
    () => resolveBuilderDraftValidationIssues(draft, context, resolvedChoiceSets),
    [context, draft, resolvedChoiceSets],
  )

  const railValidationVisibleStepIds = useMemo(
    () =>
      pruneValidationVisibleStepIds(draft, context, validationVisibleStepIds, resolvedChoiceSets),
    [context, draft, resolvedChoiceSets, validationVisibleStepIds],
  )

  useEffect(() => {
    if (railValidationVisibleStepIds.length === validationVisibleStepIds.length) {
      const isUnchanged = railValidationVisibleStepIds.every(
        (stepId, index) => stepId === validationVisibleStepIds[index],
      )
      if (isUnchanged) return
    }

    setValidationVisibleStepIds(railValidationVisibleStepIds)
  }, [railValidationVisibleStepIds, validationVisibleStepIds])

  useEffect(() => {
    if (!validationVisibleStepIds.includes(currentStepId)) {
      return
    }

    setValidationIssues((previous) =>
      resolveStepValidationIssuesAfterDraftChange(
        previous,
        draft,
        context,
        currentStepId,
        resolvedChoiceSets,
      ),
    )
  }, [context, currentStepId, draft, resolvedChoiceSets, validationVisibleStepIds])

  if (!hasHydrated) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (hasPendingRestore) {
    return (
      <>
        <CharacterBuilderDraftRestore context={context} />
        <div className="flex flex-1 items-center justify-center py-16">
          <Spinner />
        </div>
      </>
    )
  }

  const onReview = isReviewBuilderStep(currentStepId)

  const stepValidationIssues = onReview
    ? validationIssues
    : issuesForStep(validationIssues, currentStepId)

  const navigateToStep = (stepId: typeof currentStepId) => {
    if (railValidationVisibleStepIds.includes(stepId)) {
      const result = validateBuilderStepSubmit(draft, context, stepId, resolvedChoiceSets)
      setValidationIssues(result.ok ? [] : result.issues)
    } else {
      setValidationIssues([])
    }

    patchDraft({ currentStepId: stepId })
  }

  const shiftStep = (direction: 'back' | 'forward') => {
    const nextStepId = getAdjacentBuilderStepId(currentStepId, direction)
    if (!nextStepId) return
    navigateToStep(nextStepId)
  }

  const attemptStepAdvance = (patch?: Partial<CharacterBuilderDraft>) => {
    const touchedPatch = patch
      ? {
          ...patch,
          touchedStepIds: appendTouchedStepId(draft.touchedStepIds, currentStepId),
        }
      : undefined
    const nextDraft = touchedPatch ? mergeCharacterBuilderDraft(draft, touchedPatch) : draft
    if (touchedPatch) patchDraft(touchedPatch)

    const result = validateBuilderStepSubmit(nextDraft, context, currentStepId, resolvedChoiceSets)
    if (!result.ok) {
      setAttemptedStepIds((previous) => appendAttemptedStepId(previous, currentStepId))
      setValidationVisibleStepIds((previous) =>
        mergeValidationVisibleStepIds(previous, [currentStepId]),
      )
      setValidationIssues(result.issues)
      return
    }

    setValidationVisibleStepIds((previous) =>
      removeValidationVisibleStepId(previous, currentStepId),
    )
    setValidationIssues([])
    setCreateError(null)
    shiftStep('forward')
  }

  const handleFormContinueValidationFailed = (patch: Partial<CharacterBuilderDraft>) => {
    const touchedPatch = {
      ...patch,
      touchedStepIds: appendTouchedStepId(draft.touchedStepIds, currentStepId),
    }
    patchDraft(touchedPatch)
    const nextDraft = mergeCharacterBuilderDraft(draft, touchedPatch)
    setAttemptedStepIds((previous) => appendAttemptedStepId(previous, currentStepId))
    setValidationVisibleStepIds((previous) =>
      mergeValidationVisibleStepIds(previous, [currentStepId]),
    )
    const result = validateBuilderStepSubmit(nextDraft, context, currentStepId, resolvedChoiceSets)
    setValidationIssues(result.ok ? [] : result.issues)
  }

  const handleContinue = () => {
    const formHandler = runBuilderFormContinueHandler(currentStepId)
    if (formHandler) {
      void formHandler()
      return
    }

    attemptStepAdvance()
  }

  const handleCreateCharacter = async () => {
    setValidationIssues([])
    setCreateError(null)

    const validation = validateBuilderFinalSubmit(draft, context, resolvedChoiceSets)
    if (!validation.ok) {
      const issueStepIds = validation.issues.flatMap((issue) =>
        issue.stepId ? [issue.stepId] : [],
      )
      setAttemptedStepIds((previous) => mergeAttemptedStepIds(previous, issueStepIds))
      setValidationVisibleStepIds((previous) =>
        mergeValidationVisibleStepIds(previous, issueStepIds),
      )
      setValidationIssues(validation.issues)
      return
    }

    try {
      const input = finalizeCharacterBuild(draft, context, { resolvedChoiceSets })
      const character = await createCharacterMutation(input)
      await clearPersistedDraft()
      navigate(ROUTES.characters.detail(character.id))
    } catch (error) {
      if (error instanceof CharacterBuildFinalizationError) {
        const issueStepIds = error.validationIssues.flatMap((issue) =>
          issue.stepId ? [issue.stepId] : [],
        )
        setAttemptedStepIds((previous) => mergeAttemptedStepIds(previous, issueStepIds))
        setValidationVisibleStepIds((previous) =>
          mergeValidationVisibleStepIds(previous, issueStepIds),
        )
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
          <div className="flex flex-wrap gap-2">
            <Link to={ROUTES.characters.import} className={buttonVariants({ variant: 'outline' })}>
              Import character (experimental)
            </Link>
            <Link to={ROUTES.characters.list} className={buttonVariants({ variant: 'outline' })}>
              Exit
            </Link>
          </div>
        </header>

        <div className={characterBuilderShellBodyClasses}>
          <div className={characterBuilderShellColumnClasses}>
            <CharacterBuilderStepRail
              draft={draft}
              currentStepId={currentStepId}
              context={context}
              catalogIndex={catalogIndex}
              resolvedChoiceSets={resolvedChoiceSets}
              draftValidationIssues={draftValidationIssues}
              validationVisibleStepIds={railValidationVisibleStepIds}
              standardArray={context.characterCreationRules.abilityGeneration.standardArray}
              onStepSelect={navigateToStep}
            />
          </div>
          <div className={characterBuilderShellColumnClasses}>
            <CharacterBuilderStepContent
              stepId={currentStepId}
              context={context}
              draft={draft}
              preview={preview}
              resolvedChoiceSets={resolvedChoiceSets}
              validationIssues={stepValidationIssues}
              onDraftChange={applyDraftPatch}
              onStepComplete={attemptStepAdvance}
              onFormContinueValidationFailed={handleFormContinueValidationFailed}
              onNavigateToStep={navigateToStep}
            />
          </div>
          <div className={characterBuilderShellPreviewColumnClasses}>
            <CharacterBuilderPreviewPanel
              draft={draft}
              context={context}
              catalogIndex={catalogIndex}
              preview={preview}
            />
          </div>
        </div>

        {isReviewBuilderStep(currentStepId) && createError ? (
          <Text variant="destructive" role="alert">
            {createError}
          </Text>
        ) : null}

        <CharacterBuilderFooter
          currentStepId={currentStepId}
          canCreateCharacter={canCreateCharacter}
          isCreating={isCreating}
          onBack={() => shiftStep('back')}
          onContinue={handleContinue}
          onCreateCharacter={() => {
            void handleCreateCharacter()
          }}
        />
      </div>
    </>
  )
}
