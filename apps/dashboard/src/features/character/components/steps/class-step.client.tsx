'use client'

import { useMemo } from 'react'

import {
  resolveAvailableContent,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterBuildValidationIssue,
} from '@rpg/contracts'
import { RadioCard, Text } from '@rpg/ui'

import { BuilderStepFrame } from './builder-step-frame.client'

export type ClassStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}

export function ClassStep({ context, draft, validationIssues, onDraftChange }: ClassStepProps) {
  const options = useMemo(() => {
    const { classes } = resolveAvailableContent(context)
    return classes.map((entry) => ({
      value: entry.id,
      label: entry.name,
      description: `Hit die d${entry.hitDie}`,
      meta: entry.primaryAbilities.map((ability) => ability.toUpperCase()),
    }))
  }, [context])

  if (options.length === 0) {
    return (
      <BuilderStepFrame stepId="class" validationIssues={validationIssues}>
        <Text variant="muted">No classes are available for this ruleset.</Text>
      </BuilderStepFrame>
    )
  }

  return (
    <BuilderStepFrame stepId="class" validationIssues={validationIssues}>
      <RadioCard
        value={draft.class.classId ?? ''}
        onValueChange={(classId) => {
          onDraftChange({
            class: {
              ...draft.class,
              classId: classId || undefined,
            },
          })
        }}
        options={options}
        idPrefix="character-builder-class"
      />
    </BuilderStepFrame>
  )
}
