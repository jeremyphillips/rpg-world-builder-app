'use client'

import { useMemo } from 'react'

import {
  resolveReviewBlockingSummary,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterBuilderStepId,
  type CharacterBuildPreview,
  type CharacterBuildValidationIssue,
  type ChoiceSet,
} from '@rpg/contracts'
import { Text } from '@rpg/ui'

import { resolveReviewReadyMessage } from '../../lib/review-step-display'
import { BuilderStepFrame } from './builder-step-frame.client'
import { ReviewAdvisoryWarnings } from './review-advisory-warnings.client'
import { ReviewRequiredItems } from './review-required-items.client'
import { ReviewStepSummary } from './review-step-summary.client'

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
  const blockingSummary = useMemo(
    () => resolveReviewBlockingSummary(draft, context, resolvedChoiceSets, validationIssues),
    [context, draft, resolvedChoiceSets, validationIssues],
  )

  const readyMessage = useMemo(
    () =>
      resolveReviewReadyMessage(draft, context, blockingSummary.alertIssues, resolvedChoiceSets),
    [blockingSummary.alertIssues, context, draft, resolvedChoiceSets],
  )

  return (
    <BuilderStepFrame
      stepId="review"
      validationIssues={blockingSummary.alertIssues}
      validationHeading={REVIEW_VALIDATION_HEADING}
    >
      <div className="space-y-6">
        <ReviewStepSummary context={context} draft={draft} preview={preview} />
        <ReviewRequiredItems
          requiredItems={blockingSummary.requiredItems}
          onNavigateToStep={onNavigateToStep}
        />
        <ReviewAdvisoryWarnings warnings={preview?.warnings ?? []} />
        {readyMessage ? <Text variant="muted">{readyMessage}</Text> : null}
      </div>
    </BuilderStepFrame>
  )
}
