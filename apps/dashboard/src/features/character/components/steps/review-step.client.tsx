'use client'

import { useMemo } from 'react'

import type {
  CharacterBuildContext,
  CharacterBuilderDraft,
  CharacterBuildPreview,
  CharacterBuildValidationIssue,
  ChoiceSet,
} from '@rpg/contracts'
import { Text } from '@rpg/ui'

import {
  resolveReviewDisplayIssues,
  resolveReviewReadyMessage,
} from '../../lib/review-step-display'
import { BuilderStepFrame } from './builder-step-frame.client'
import { ReviewStepSummary } from './review-step-summary.client'

export type ReviewStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  preview: CharacterBuildPreview | null
  resolvedChoiceSets: readonly ChoiceSet[]
  validationIssues?: CharacterBuildValidationIssue[]
}

export function ReviewStep({
  context,
  draft,
  preview,
  resolvedChoiceSets,
  validationIssues = [],
}: ReviewStepProps) {
  const displayIssues = useMemo(
    () => resolveReviewDisplayIssues(draft, context, validationIssues, resolvedChoiceSets),
    [context, draft, resolvedChoiceSets, validationIssues],
  )

  const readyMessage = useMemo(
    () => resolveReviewReadyMessage(draft, context, displayIssues, resolvedChoiceSets),
    [context, draft, displayIssues, resolvedChoiceSets],
  )

  return (
    <BuilderStepFrame stepId="review" validationIssues={displayIssues}>
      <ReviewStepSummary context={context} draft={draft} preview={preview} />
      {readyMessage ? <Text variant="muted">{readyMessage}</Text> : null}
    </BuilderStepFrame>
  )
}
