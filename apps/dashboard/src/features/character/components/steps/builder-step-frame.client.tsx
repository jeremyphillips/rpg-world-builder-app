'use client'

import type { ReactNode } from 'react'

import {
  BUILDER_STEPS,
  type CharacterBuilderStepId,
  type CharacterBuildValidationIssue,
} from '@rpg/contracts'
import { Heading, Text } from '@rpg/ui'

import { CharacterBuilderValidationAlert } from '../character-builder-validation-alert.client'
import { characterBuilderStepPanelClasses } from '../character-builder-shell.variants'

export type BuilderStepFrameProps = {
  stepId: CharacterBuilderStepId
  validationIssues?: CharacterBuildValidationIssue[]
  children: ReactNode
}

export function BuilderStepFrame({
  stepId,
  validationIssues = [],
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

      <CharacterBuilderValidationAlert issues={validationIssues} />
      {children}
    </section>
  )
}
