'use client'

import type { ReactNode } from 'react'

import {
  BUILDER_STEPS,
  characterBuilderValidationMessages,
  formatFieldMessage,
} from '@rpg/contracts'
import type {
  CharacterBuilderStepId,
  CharacterBuildValidationIssue,
} from '@rpg/contracts/rpg/character-builder'
import { Heading, Text } from '@rpg/ui'

import { CharacterBuilderValidationAlert } from '../../chrome/character-builder-validation-alert.client'
import { characterBuilderStepPanelClasses } from '../../character-builder-shell.variants'

const STEP_VALIDATION_HEADING = formatFieldMessage(
  characterBuilderValidationMessages.stepIncomplete(),
)

export type BuilderStepFrameProps = {
  stepId: CharacterBuilderStepId
  validationIssues?: CharacterBuildValidationIssue[]
  validationHeading?: string
  children: ReactNode
}

export function BuilderStepFrame({
  stepId,
  validationIssues = [],
  validationHeading,
  children,
}: BuilderStepFrameProps) {
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

      <CharacterBuilderValidationAlert
        issues={validationIssues}
        heading={validationHeading ?? STEP_VALIDATION_HEADING}
      />
      {children}
    </section>
  )
}
