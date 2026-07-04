'use client'

import {
  BUILDER_STEPS,
  getBuilderStepStatus,
  type BuilderStepStatus,
  type CharacterBuilderDraft,
  type CharacterBuilderStepId,
} from '@rpg/contracts'
import { Badge, cn, Text } from '@rpg/ui'

import {
  BUILDER_STEP_STATUS_LABELS,
  builderStepStatusBadgeVariant,
} from '../lib/builder-step-status-display'
import {
  characterBuilderStepRailClasses,
  characterBuilderStepRailItemActiveClasses,
  characterBuilderStepRailItemClasses,
} from './character-builder-shell.variants'

export type CharacterBuilderStepRailProps = {
  draft: CharacterBuilderDraft
  currentStepId: CharacterBuilderStepId
  /** Pass `null` in MVP-A so choice-dependent steps show as deferred. */
  resolvedChoiceSets: null
  onStepSelect: (stepId: CharacterBuilderStepId) => void
}

export function CharacterBuilderStepRail({
  draft,
  currentStepId,
  resolvedChoiceSets,
  onStepSelect,
}: CharacterBuilderStepRailProps) {
  return (
    <nav aria-label="Character builder steps">
      <ol className={characterBuilderStepRailClasses}>
        {BUILDER_STEPS.map((step) => {
          const status = getBuilderStepStatus(step.id, draft, resolvedChoiceSets)
          const isActive = currentStepId === step.id

          return (
            <li key={step.id}>
              <button
                type="button"
                aria-current={isActive ? 'step' : undefined}
                className={cn(
                  characterBuilderStepRailItemClasses,
                  isActive && characterBuilderStepRailItemActiveClasses,
                )}
                onClick={() => onStepSelect(step.id)}
              >
                <span className="min-w-0 space-y-0.5">
                  <Text as="span" variant="body" className="block font-medium">
                    {step.label}
                  </Text>
                  <Text as="span" variant="muted" className="block text-xs">
                    {step.description}
                  </Text>
                </span>
                <StepStatusBadge status={status} />
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function StepStatusBadge({ status }: { status: BuilderStepStatus }) {
  return (
    <Badge
      size="sm"
      variant={builderStepStatusBadgeVariant(status)}
      className="shrink-0 self-start"
    >
      {BUILDER_STEP_STATUS_LABELS[status]}
    </Badge>
  )
}
