'use client'

import { useCallback, useRef } from 'react'
import {
  BUILDER_STEPS,
  resolveBuilderStepDescription,
  type CharacterBuildCatalogIndex,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterBuilderStepId,
  type CharacterBuildValidationIssue,
  type ChoiceSet,
} from '@rpg/contracts'
import { cn, Text } from '@rpg/ui'
import { CheckCircle2, Circle, CircleAlert, CircleDot, Lock, type LucideIcon } from 'lucide-react'

import {
  resolveStepRailIndex,
  resolveStepRailKeyboardDirection,
  resolveStepRailKeyboardTarget,
} from '../lib/character-builder-step-rail-keyboard.lib'
import {
  resolveStepVisualStatus,
  stepStatusAriaLabel,
  type StepStatus,
} from '../lib/builder-step-visual-status'
import {
  characterBuilderStepRailClasses,
  characterBuilderStepRailIconClasses,
  characterBuilderStepRailItemActiveClasses,
  characterBuilderStepRailItemClasses,
  characterBuilderStepRailItemLabelActiveClasses,
} from './character-builder-shell.variants'

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
  standardArray: readonly number[]
  onStepSelect: (stepId: CharacterBuilderStepId) => void
}

const STEP_STATUS_ICONS: Record<StepStatus, LucideIcon> = {
  idle: Circle,
  active: CircleDot,
  complete: CheckCircle2,
  error: CircleAlert,
  locked: Lock,
}

const STEP_STATUS_ICON_CLASSES: Record<StepStatus, string> = {
  idle: 'text-muted-foreground',
  active: 'text-foreground',
  complete: 'text-success',
  error: 'text-destructive',
  locked: 'text-muted-foreground',
}

export function CharacterBuilderStepRail({
  draft,
  currentStepId,
  context,
  catalogIndex,
  resolvedChoiceSets,
  draftValidationIssues,
  validationVisibleStepIds,
  standardArray,
  onStepSelect,
}: CharacterBuilderStepRailProps) {
  const stepButtonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const currentStepIndex = resolveStepRailIndex(currentStepId)

  const focusStepAtIndex = useCallback((index: number) => {
    stepButtonRefs.current[index]?.focus()
  }, [])

  const handleStepRailKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      const direction = resolveStepRailKeyboardDirection(event.key)
      if (!direction) return

      const targetIndex = resolveStepRailKeyboardTarget(direction, currentStepIndex)
      if (targetIndex === null || targetIndex === currentStepIndex) return

      event.preventDefault()
      const targetStep = BUILDER_STEPS[targetIndex]
      if (!targetStep) return

      focusStepAtIndex(targetIndex)
      onStepSelect(targetStep.id)
    },
    [currentStepIndex, focusStepAtIndex, onStepSelect],
  )

  return (
    <nav aria-label="Character builder steps" onKeyDown={handleStepRailKeyDown}>
      <ol className={characterBuilderStepRailClasses}>
        {BUILDER_STEPS.map((step, index) => {
          const visualStatus = resolveStepVisualStatus({
            stepId: step.id,
            draft,
            currentStepId,
            context,
            resolvedChoiceSets,
            draftValidationIssues,
            validationVisibleStepIds,
            catalogIndex,
            standardArray,
          })
          const isActive = currentStepId === step.id
          const Icon = STEP_STATUS_ICONS[visualStatus]

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
                <Icon
                  aria-hidden
                  className={cn(
                    characterBuilderStepRailIconClasses,
                    STEP_STATUS_ICON_CLASSES[visualStatus],
                  )}
                />
                <span className="min-w-0 space-y-0.5">
                  <Text
                    as="span"
                    variant="body"
                    className={cn(
                      'block font-medium',
                      isActive && characterBuilderStepRailItemLabelActiveClasses,
                    )}
                  >
                    {step.label}
                  </Text>
                  <Text as="span" variant="muted" className="block text-xs">
                    {resolveBuilderStepDescription(context, step.id)}
                  </Text>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
