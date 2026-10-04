import { useCallback, useRef } from 'react'
import {
  resolveEffectiveBuilderSteps,
  type CharacterBuildCatalogIndex,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type ChoiceSet,
} from '@rpg/contracts'
import type {
  CharacterBuilderStepId,
  CharacterBuildValidationIssue,
} from '@rpg/contracts/rpg/character-builder'
import { cn, StatusIcon, Text } from '@rpg/ui'

import {
  resolveStepRailKeyboardDirection,
  resolveStepRailKeyboardTarget,
} from '../../../lib/builder/character-builder-step-rail-keyboard.lib'
import { resolveStepStatusIconVariant } from '../../../lib/builder/builder-step-status-icon.lib'
import {
  resolveStepVisualStatus,
  stepStatusAriaLabel,
} from '../../../lib/builder/builder-step-visual-status'
import {
  characterBuilderStepRailClasses,
  characterBuilderStepRailIconClasses,
  characterBuilderStepRailItemActiveClasses,
  characterBuilderStepRailItemClasses,
  characterBuilderStepRailItemLabelActiveClasses,
  characterBuilderStepRailNavClasses,
} from '../character-builder-shell.variants'

export type CharacterBuilderStepRailProps = {
  draft: CharacterBuilderDraft
  currentStepId: CharacterBuilderStepId
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
  /** Pass `null` in MVP-A so choice-dependent steps show as deferred. */
  resolvedChoiceSets: readonly ChoiceSet[] | null
  /** Live draft-phase issues used for completion/readiness only — not rail error icons. */
  draftValidationIssues: CharacterBuildValidationIssue[]
  /** Steps that may show a rail error after a failed Continue or Create. */
  validationVisibleStepIds: readonly CharacterBuilderStepId[]
  onStepSelect: (stepId: CharacterBuilderStepId) => void
}

export function CharacterBuilderStepRail({
  draft,
  currentStepId,
  context,
  catalogIndex,
  resolvedChoiceSets,
  draftValidationIssues,
  validationVisibleStepIds,
  onStepSelect,
}: CharacterBuilderStepRailProps) {
  const stepButtonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const effectiveSteps = resolveEffectiveBuilderSteps(context, draft)
  const currentStepIndex = effectiveSteps.findIndex((step) => step.id === currentStepId)

  const focusStepAtIndex = useCallback((index: number) => {
    stepButtonRefs.current[index]?.focus()
  }, [])

  const handleStepRailKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      const direction = resolveStepRailKeyboardDirection(event.key)
      if (!direction) return

      const targetIndex = resolveStepRailKeyboardTarget(
        direction,
        currentStepIndex,
        effectiveSteps.length,
      )
      if (targetIndex === null || targetIndex === currentStepIndex) return

      event.preventDefault()
      const targetStep = effectiveSteps[targetIndex]
      if (!targetStep) return

      focusStepAtIndex(targetIndex)
      onStepSelect(targetStep.id)
    },
    [currentStepIndex, effectiveSteps, focusStepAtIndex, onStepSelect],
  )

  return (
    <nav
      aria-label="Character builder steps"
      className={characterBuilderStepRailNavClasses}
      onKeyDown={handleStepRailKeyDown}
    >
      <ol className={characterBuilderStepRailClasses}>
        {effectiveSteps.map((step, index) => {
          const visualStatus = resolveStepVisualStatus({
            stepId: step.id,
            draft,
            currentStepId,
            context,
            resolvedChoiceSets,
            draftValidationIssues,
            validationVisibleStepIds,
            catalogIndex,
          })
          const isActive = currentStepId === step.id

          return (
            <li key={step.id}>
              <button
                ref={(element) => {
                  stepButtonRefs.current[index] = element
                }}
                type="button"
                tabIndex={isActive ? 0 : -1}
                aria-current={isActive ? 'step' : undefined}
                aria-label={stepStatusAriaLabel(step.label, visualStatus)}
                className={cn(
                  characterBuilderStepRailItemClasses,
                  isActive && characterBuilderStepRailItemActiveClasses,
                )}
                onClick={() => onStepSelect(step.id)}
              >
                <StatusIcon
                  variant={resolveStepStatusIconVariant(visualStatus)}
                  size="md"
                  className={characterBuilderStepRailIconClasses}
                />
                <Text
                  as="span"
                  variant="body"
                  className={cn(
                    'min-w-0 font-medium',
                    isActive && characterBuilderStepRailItemLabelActiveClasses,
                  )}
                >
                  {step.label}
                </Text>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
