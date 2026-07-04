'use client'

import { Link } from 'react-router-dom'

import {
  getBuilderStepStatus,
  type CharacterBuildCatalogIndex,
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
import { CharacterBuilderDraftRestore } from './character-builder-draft-restore.client'
import { CharacterBuilderFooter } from './character-builder-footer.client'
import { CharacterBuilderPreviewPanel } from './character-builder-preview-panel.client'
import {
  characterBuilderShellGridClasses,
  characterBuilderShellHeaderClasses,
  characterBuilderShellRootClasses,
} from './character-builder-shell.variants'
import { CharacterBuilderStepPanel } from './character-builder-step-panel.client'
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
  const stepStatus = getBuilderStepStatus(currentStepId, draft, resolvedChoiceSets)

  const navigateToStep = (stepId: typeof currentStepId) => {
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
          <CharacterBuilderStepPanel stepId={currentStepId} status={stepStatus} />
          <CharacterBuilderPreviewPanel preview={preview} />
        </div>

        <CharacterBuilderFooter
          currentStepId={currentStepId}
          onBack={() => shiftStep('back')}
          onContinue={() => shiftStep('forward')}
          onCreateCharacter={() => {
            // Wired in a later phase: finalizeCharacterBuild → POST /api/characters
          }}
        />
      </div>
    </>
  )
}
