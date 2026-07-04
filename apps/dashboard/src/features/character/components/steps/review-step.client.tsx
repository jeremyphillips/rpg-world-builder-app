'use client'

import { useMemo } from 'react'

import {
  getAlignmentLabel,
  validateCharacterBuild,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
} from '@rpg/contracts'
import { Text } from '@rpg/ui'

import { BuilderStepFrame } from './builder-step-frame.client'

export type ReviewStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
}

export function ReviewStep({ context, draft }: ReviewStepProps) {
  const validation = useMemo(
    () =>
      validateCharacterBuild(draft, context, 'finalSubmit', {
        resolvedChoiceSets: [],
      }),
    [context, draft],
  )

  const speciesName =
    context.catalog.species.find((entry) => entry.id === draft.species.speciesId)?.name ??
    'Not selected'
  const className =
    context.catalog.classes.find((entry) => entry.id === draft.class.classId)?.name ??
    'Not selected'

  return (
    <BuilderStepFrame stepId="review" validationIssues={validation.issues}>
      <dl className="grid gap-3 sm:grid-cols-2">
        <ReviewRow label="Name" value={draft.identity.name?.trim() || 'Not set'} />
        <ReviewRow
          label="Alignment"
          value={draft.identity.alignment ? getAlignmentLabel(draft.identity.alignment) : 'Not set'}
        />
        <ReviewRow label="Species" value={speciesName} />
        <ReviewRow label="Class" value={className} />
        <ReviewRow
          label="Ability method"
          value={
            draft.abilities.method === 'manual'
              ? 'Manual entry'
              : draft.abilities.method === 'standard-array'
                ? 'Standard array'
                : 'Not set'
          }
        />
      </dl>

      {validation.ok ? (
        <Text variant="muted">Your character is ready to create once submission is enabled.</Text>
      ) : (
        <Text variant="muted">Resolve the issues above before creating your character.</Text>
      )}
    </BuilderStepFrame>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  )
}
