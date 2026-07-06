'use client'

import {
  BUILDER_STEPS,
  type CharacterBuildCatalogIndex,
  type CharacterBuilderDraft,
  type CharacterBuilderStepId,
  type CharacterBuildValidationIssue,
  type ChoiceSet,
} from '@rpg/contracts'
import { cn, Text } from '@rpg/ui'
import { CheckCircle2, Circle, CircleAlert, CircleDot, Lock, type LucideIcon } from 'lucide-react'

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
  catalogIndex: CharacterBuildCatalogIndex
  /** Pass `null` in MVP-A so choice-dependent steps show as deferred. */
  resolvedChoiceSets: readonly ChoiceSet[] | null
  validationIssues: CharacterBuildValidationIssue[]
  attemptedStepIds: readonly CharacterBuilderStepId[]
  standardArray: readonly number[]
  onStepSelect: (stepId: CharacterBuilderStepId) => void
}

const STEP_STATUS_ICONS: Record<StepStatus, LucideIcon> = {
  notStarted: Circle,
  current: CircleDot,
  complete: CheckCircle2,
  warning: CircleAlert,
  locked: Lock,
}

const STEP_STATUS_ICON_CLASSES: Record<StepStatus, string> = {
  notStarted: 'text-muted-foreground',
  current: 'text-foreground',
  complete: 'text-success',
  warning: 'text-destructive',
  locked: 'text-muted-foreground',
}

export function CharacterBuilderStepRail({
  draft,
  currentStepId,
  catalogIndex,
  resolvedChoiceSets,
  validationIssues,
  attemptedStepIds,
  standardArray,
  onStepSelect,
}: CharacterBuilderStepRailProps) {
  return (
    <nav aria-label="Character builder steps">
      <ol className={characterBuilderStepRailClasses}>
        {BUILDER_STEPS.map((step) => {
          const visualStatus = resolveStepVisualStatus({
            stepId: step.id,
            draft,
            currentStepId,
            resolvedChoiceSets,
            validationIssues,
            attemptedStepIds,
            catalogIndex,
            standardArray,
          })
          const isActive = currentStepId === step.id
          const Icon = STEP_STATUS_ICONS[visualStatus]

          return (
            <li key={step.id}>
              <button
                type="button"
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
                    {step.description}
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
