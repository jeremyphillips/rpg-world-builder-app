'use client'

import { BUILDER_STEPS, type BuilderStepStatus, type CharacterBuilderStepId } from '@rpg/contracts'
import { Heading, Text } from '@rpg/ui'

import { characterBuilderStepPanelClasses } from './character-builder-shell.variants'

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

      {status === 'deferred' ? (
        <Text variant="muted">
          Proficiency, equipment, and spell choices arrive in a later milestone. You can continue to
          Review without completing this step.
        </Text>
      ) : (
        <Text variant="muted">Step fields are implemented in the next builder phase.</Text>
      )}
    </section>
  )
}
