'use client'

import { useMemo } from 'react'

import type {
  CharacterBuildContext,
  CharacterBuilderDraft,
  CharacterBuildPreview,
  CharacterBuildValidationIssue,
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
  validationIssues?: CharacterBuildValidationIssue[]
}

export function ReviewStep({ context, draft, preview, validationIssues = [] }: ReviewStepProps) {
  const displayIssues = useMemo(
    () => resolveReviewDisplayIssues(draft, context, validationIssues),
    [context, draft, validationIssues],
  )

  const readyMessage = useMemo(
    () => resolveReviewReadyMessage(draft, context, displayIssues),
    [context, draft, displayIssues],
  )

  return (
    <BuilderStepFrame stepId="review" validationIssues={displayIssues}>
      <ReviewStepSummary context={context} draft={draft} preview={preview} />
      {readyMessage ? <Text variant="muted">{readyMessage}</Text> : null}
    </BuilderStepFrame>
  )
}
