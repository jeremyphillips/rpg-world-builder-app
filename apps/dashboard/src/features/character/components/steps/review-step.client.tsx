'use client'

import { useMemo } from 'react'

import {
  resolveUnresolvedChoiceSetSummaries,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterBuilderStepId,
  type CharacterBuildPreview,
  type CharacterBuildValidationIssue,
  type ChoiceSet,
} from '@rpg/contracts'
import { Text } from '@rpg/ui'

import {
  resolveReviewDisplayIssues,
  resolveReviewReadyMessage,
} from '../../lib/review-step-display'
import { BuilderStepFrame } from './builder-step-frame.client'
import { ReviewAdvisoryWarnings } from './review-advisory-warnings.client'
import { ReviewStepSummary } from './review-step-summary.client'
import { ReviewUnresolvedChoices } from './review-unresolved-choices.client'

const REVIEW_VALIDATION_HEADING = 'Fix the following before creating:'

export type ReviewStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  preview: CharacterBuildPreview | null
  resolvedChoiceSets: readonly ChoiceSet[]
  validationIssues?: CharacterBuildValidationIssue[]
  onNavigateToStep: (stepId: CharacterBuilderStepId) => void
}

export function ReviewStep({
  context,
  draft,
  preview,
  resolvedChoiceSets,
  validationIssues = [],
  onNavigateToStep,
}: ReviewStepProps) {
  const displayIssues = useMemo(
    () => resolveReviewDisplayIssues(draft, context, validationIssues, resolvedChoiceSets),
    [context, draft, resolvedChoiceSets, validationIssues],
  )

  const unresolvedChoices = useMemo(
    () => resolveUnresolvedChoiceSetSummaries(draft, resolvedChoiceSets),
    [draft, resolvedChoiceSets],
  )

  const readyMessage = useMemo(
    () => resolveReviewReadyMessage(draft, context, displayIssues, resolvedChoiceSets),
    [context, draft, displayIssues, resolvedChoiceSets],
  )

  return (
    <BuilderStepFrame
      stepId="review"
      validationIssues={displayIssues}
      validationHeading={REVIEW_VALIDATION_HEADING}
    >
      <div className="space-y-6">
        <ReviewStepSummary context={context} draft={draft} preview={preview} />
        <ReviewUnresolvedChoices
          unresolvedChoices={unresolvedChoices}
          onNavigateToStep={onNavigateToStep}
        />
        <ReviewAdvisoryWarnings warnings={preview?.warnings ?? []} />
        {readyMessage ? <Text variant="muted">{readyMessage}</Text> : null}
      </div>
    </BuilderStepFrame>
  )
}
