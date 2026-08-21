'use client'

import { useMemo } from 'react'

import {
  resolveReviewBlockingSummary,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterBuildPreview,
  type ChoiceSet,
} from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'
import { Text } from '@rpg/ui'

import { resolveReviewReadyMessage } from '../../../../lib/builder-preview/review-step-display'
import { BuilderStepFrame } from '../shared/builder-step-frame.client'
import { ReviewAdvisoryWarnings } from './review-advisory-warnings.client'
import { ReviewRequiredItems } from './review-required-items.client'
import { ReviewStepSummary } from './review-step-summary.client'

import type { CharacterBuilderNavigateToStep } from '../../../../lib/builder/character-builder-navigation-options'

export type ReviewStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  preview: CharacterBuildPreview | null
  resolvedChoiceSets: readonly ChoiceSet[]
  validationIssues?: CharacterBuildValidationIssue[]
  validationHeading: string
  onNavigateToStep: CharacterBuilderNavigateToStep
}

export function ReviewStep({
  context,
  draft,
  preview,
  resolvedChoiceSets,
  validationIssues = [],
  validationHeading,
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
      validationHeading={validationHeading}
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
