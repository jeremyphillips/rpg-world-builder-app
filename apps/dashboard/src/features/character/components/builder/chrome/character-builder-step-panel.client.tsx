'use client'

import { BUILDER_STEPS, type BuilderStepStatus } from '@rpg/contracts'
import type { CharacterBuilderStepId } from '@rpg/contracts/rpg/character-builder'
import { Heading, Text } from '@rpg/ui'

import { characterBuilderStepPanelClasses } from '../character-builder-shell.variants'

export type CharacterBuilderStepPanelProps = {
  stepId: CharacterBuilderStepId
  status: BuilderStepStatus
}

export function CharacterBuilderStepPanel({ stepId, status }: CharacterBuilderStepPanelProps) {
  const step = BUILDER_STEPS.find((entry) => entry.id === stepId)
  if (!step) return null

  return (
    <section
      aria-labelledby="character-builder-step-heading"
      className={characterBuilderStepPanelClasses}
    >
      <div className="space-y-1">
        <Heading variant="section" as="h2" id="character-builder-step-heading">
          {step.label}
        </Heading>
        <Text variant="muted">{step.description}</Text>
      </div>

      <Text variant="muted">{getStubMessage(stepId, status)}</Text>
    </section>
  )
}

function getStubMessage(stepId: CharacterBuilderStepId, status: BuilderStepStatus): string {
  if (stepId === 'spells' && status === 'deferred') {
    return 'Spell selection is not required for non-caster classes in this milestone. Continue to Review when you are ready.'
  }

  if (status === 'deferred') {
    return 'Proficiency and equipment choices arrive in a later milestone. You can continue to Review without completing this step.'
  }

  return 'Step fields are implemented in the next builder phase.'
}
