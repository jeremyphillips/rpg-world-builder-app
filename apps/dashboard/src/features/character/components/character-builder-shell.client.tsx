'use client'

import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  type CharacterBuildCatalogIndex,
  type CharacterBuilderDraft,
  type CharacterBuildValidationIssue,
  type StandaloneBuildContext,
} from '@rpg/contracts'
import { buttonVariants, Heading, Spinner } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

import { useCharacterPreview } from '../hooks/use-character-preview'
import { useCharacterBuilderStore } from '../hooks/use-character-builder-store'
import {
  appendTouchedStepId,
  getAdjacentBuilderStepId,
  resolveCurrentStepId,
} from '../lib/character-builder-navigation'
import { mergeCharacterBuilderDraft } from '../lib/merge-character-builder-draft'
import { getBuilderStepFormId } from '../lib/steps/builder-step-form-ids'
import { issuesForStep, validateBuilderStepSubmit } from '../lib/validate-builder-step'
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
  const hasHydrated = useCharacterBuilderStore(context, (state) => state._hasHydrated)
  const draft = useCharacterBuilderStore(context, (state) => state.draft)
  const patchDraft = useCharacterBuilderStore(context, (state) => state.patchDraft)
  const [validationIssues, setValidationIssues] = useState<CharacterBuildValidationIssue[]>([])

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
  const stepValidationIssues = issuesForStep(validationIssues, currentStepId)

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
    shiftStep('forward')
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
            validationIssues={stepValidationIssues}
            onDraftChange={applyDraftPatch}
            onStepComplete={attemptStepAdvance}
          />
          <CharacterBuilderPreviewPanel preview={preview} />
        </div>

        <CharacterBuilderFooter
          currentStepId={currentStepId}
          continueFormId={getBuilderStepFormId(currentStepId)}
          onBack={() => shiftStep('back')}
          onContinue={() => attemptStepAdvance()}
          onCreateCharacter={() => {
            // Wired in a later phase: finalizeCharacterBuild → POST /api/characters
          }}
        />
      </div>
    </>
  )
}
