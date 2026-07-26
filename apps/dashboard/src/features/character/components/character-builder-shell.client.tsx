'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  CharacterBuildFinalizationError,
  finalizeCharacterBuild,
  finalizeNpcCharacterBuild,
  getErrorMessage,
  resolveBuilderLevelConstraints,
  type CharacterBuildCatalogIndex,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterBuilderStepId,
  type CharacterBuildValidationIssue,
  type EquipmentPickerFocusIntent,
} from '@rpg/contracts'
import { buttonVariants, Heading, Spinner, Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

import { useResolvedChoiceSets } from '../hooks/use-resolved-choice-sets'
import { useCharacterPreview } from '../hooks/use-character-preview'
import { useCharacterBuilderStore } from '../hooks/use-character-builder-store'
import { useCreateCharacter } from '../hooks/use-create-character'
import { useCreateNpc } from '../npc/hooks/use-create-npc'
import {
  getBuilderChromeCopyForContext,
  resolveCampaignIdFromContext,
} from '../lib/builder-chrome-copy'
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
import type { CharacterBuilderNavigateToStepOptions } from '../lib/character-builder-navigation-options'
import {
  issuesForStep,
  resolveBuilderDraftValidationIssues,
  resolveStepValidationIssuesAfterDraftChange,
  validateBuilderFinalSubmit,
  validateBuilderStepSubmit,
} from '../lib/validate-builder-step'
import { CharacterBuilderDraftRestore } from './character-builder-draft-restore.client'
import { CharacterBuilderFooter } from './character-builder-footer.client'
import { CharacterBuilderLevelControl } from './character-builder-level-control.client'
import { CharacterBuilderPreviewPanel } from './character-builder-preview-panel.client'
import {
  characterBuilderShellBodyClasses,
  characterBuilderShellColumnClasses,
  characterBuilderShellHeaderClasses,
  characterBuilderShellHeaderTitleRowClasses,
  characterBuilderShellPreviewColumnClasses,
  characterBuilderShellRootClasses,
} from './character-builder-shell.variants'
import { CharacterBuilderStepContent } from './character-builder-step-content.client'
import { CharacterBuilderStepRail } from './character-builder-step-rail.client'

export type CharacterBuilderShellProps = {
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
}

/** Full-viewport builder chrome: step rail, step panel, live preview, footer nav. */
export function CharacterBuilderShell({ context, catalogIndex }: CharacterBuilderShellProps) {
  const navigate = useNavigate()
  const chrome = getBuilderChromeCopyForContext(context)
  const campaignId = resolveCampaignIdFromContext(context)
  const { mutateAsync: createCharacterMutation, isPending: isCreatingPc } = useCreateCharacter()
  const { mutateAsync: createNpcMutation, isPending: isCreatingNpc } = useCreateNpc()
  const isCreating = isCreatingPc || isCreatingNpc
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
  const [pendingEquipmentPickerFocus, setPendingEquipmentPickerFocus] = useState<
    EquipmentPickerFocusIntent | undefined
  >()

  const resolvedChoiceSets = useResolvedChoiceSets(draft, context)

  const currentStepId = resolveCurrentStepId(draft.currentStepId)
  const levelConstraints = useMemo(() => resolveBuilderLevelConstraints(context), [context])

  useEffect(() => {
    if (levelConstraints.mode !== 'fixed' || levelConstraints.fixedLevel === undefined) {
      return
    }

    if (draft.class.level === levelConstraints.fixedLevel) {
      return
    }

    patchDraft({
      class: {
        ...draft.class,
        level: levelConstraints.fixedLevel,
      },
    })
  }, [draft.class, levelConstraints.fixedLevel, levelConstraints.mode, patchDraft])

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

  const applyLevelDraft = useCallback(
    (nextDraft: CharacterBuilderDraft) => {
      applyDraftPatch({
        class: nextDraft.class,
        choiceSelections: nextDraft.choiceSelections,
      })
    },
    [applyDraftPatch],
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

  const handleEquipmentPickerFocusConsumed = useCallback(() => {
    setPendingEquipmentPickerFocus(undefined)
  }, [])

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

  const navigateToStep = (
    stepId: typeof currentStepId,
    options?: CharacterBuilderNavigateToStepOptions,
  ) => {
    if (options?.equipmentPickerFocus) {
      setPendingEquipmentPickerFocus(options.equipmentPickerFocus)
    }

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
      if (context.characterKind === 'npc') {
        if (!campaignId) {
          setCreateError(chrome.createErrorDefault)
          return
        }

        const input = finalizeNpcCharacterBuild(draft, context, { resolvedChoiceSets })
        const npc = await createNpcMutation({ campaignId, input })
        await clearPersistedDraft()
        navigate(ROUTES.campaign.npcs.detail(campaignId, npc.character.id))
        return
      }

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

      setCreateError(getErrorMessage(error, chrome.createErrorDefault))
    }
  }

  return (
    <>
      <CharacterBuilderDraftRestore context={context} />

      <div className={characterBuilderShellRootClasses}>
        <header className={characterBuilderShellHeaderClasses}>
          <div className={characterBuilderShellHeaderTitleRowClasses}>
            <Heading variant="page" as="h1" className="shrink-0">
              {chrome.pageHeading}
            </Heading>
            <CharacterBuilderLevelControl
              context={context}
              draft={draft}
              onApplyLevelDraft={applyLevelDraft}
            />
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {chrome.importHref && chrome.importLabel ? (
              <Link to={chrome.importHref} className={buttonVariants({ variant: 'outline' })}>
                {chrome.importLabel}
              </Link>
            ) : null}
            <Link to={chrome.exitHref} className={buttonVariants({ variant: 'outline' })}>
              {chrome.exitLabel}
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
              reviewValidationHeading={chrome.reviewValidationHeading}
              onDraftChange={applyDraftPatch}
              onStepComplete={attemptStepAdvance}
              onFormContinueValidationFailed={handleFormContinueValidationFailed}
              onNavigateToStep={navigateToStep}
              equipmentPickerFocus={pendingEquipmentPickerFocus}
              onEquipmentPickerFocusConsumed={handleEquipmentPickerFocusConsumed}
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
          createLabel={chrome.createLabel}
          creatingLabel={chrome.creatingLabel}
          reviewFooterHint={chrome.reviewFooterHint}
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
