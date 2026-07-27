import {
  getErrorMessage,
  isCampaignInviteBuildContext,
  isCampaignPcOnboardingBuildContext,
  isCharacterBuildFinalizationError,
  resolveCampaignCharacterAssignmentError,
  type CampaignInviteUnavailableReason,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterBuilderStepId,
  type CharacterBuildValidationIssue,
  type CharacterCampaignBlockingIssue,
  type CharacterCampaignWarning,
} from '@rpg/contracts'

export type BuilderCreateFailureOutcome =
  | { kind: 'validation'; issues: CharacterBuildValidationIssue[] }
  | {
      kind: 'campaign_eligibility'
      blockingIssues: CharacterCampaignBlockingIssue[]
      warnings: CharacterCampaignWarning[]
    }
  | { kind: 'invite_unavailable'; reason: CampaignInviteUnavailableReason }
  | { kind: 'create_error'; message: string }

export { isCampaignInviteBuildContext }

export function validationIssueStepIds(
  issues: readonly CharacterBuildValidationIssue[],
): CharacterBuilderStepId[] {
  return issues.flatMap((issue) => (issue.stepId ? [issue.stepId] : []))
}

export type BuilderCreateFailureHandlers = {
  applyValidationIssues: (issues: CharacterBuildValidationIssue[]) => void
  patchDraft: (patch: Partial<CharacterBuilderDraft>) => void
  setCampaignEligibilityError: (error: {
    blockingIssues: CharacterCampaignBlockingIssue[]
    warnings: CharacterCampaignWarning[]
  }) => void
  setCreateError: (message: string) => void
  onInviteUnavailable?: (reason: CampaignInviteUnavailableReason) => void
}

export function applyBuilderCreateFailure(
  outcome: BuilderCreateFailureOutcome,
  handlers: BuilderCreateFailureHandlers,
): void {
  switch (outcome.kind) {
    case 'validation':
      handlers.applyValidationIssues(outcome.issues)
      return
    case 'campaign_eligibility':
      handlers.setCampaignEligibilityError({
        blockingIssues: outcome.blockingIssues,
        warnings: outcome.warnings,
      })
      handlers.patchDraft({ currentStepId: 'review' })
      return
    case 'invite_unavailable':
      handlers.onInviteUnavailable?.(outcome.reason)
      return
    case 'create_error':
      handlers.setCreateError(outcome.message)
      return
  }
}

export function resolveBuilderCreateFailure(
  error: unknown,
  {
    context,
    defaultMessage,
  }: {
    context: CharacterBuildContext
    defaultMessage: string
  },
): BuilderCreateFailureOutcome {
  if (isCharacterBuildFinalizationError(error)) {
    return { kind: 'validation', issues: error.validationIssues }
  }

  if (isCampaignInviteBuildContext(context) || isCampaignPcOnboardingBuildContext(context)) {
    const resolved = resolveCampaignCharacterAssignmentError(error, defaultMessage)

    if (resolved.kind === 'build_invalid') {
      return { kind: 'validation', issues: resolved.issues }
    }

    if (resolved.kind === 'campaign_ineligible') {
      return {
        kind: 'campaign_eligibility',
        blockingIssues: resolved.blockingIssues,
        warnings: resolved.warnings,
      }
    }

    if (resolved.kind === 'invite_unavailable') {
      return { kind: 'invite_unavailable', reason: resolved.reason }
    }

    return { kind: 'create_error', message: resolved.message }
  }

  return {
    kind: 'create_error',
    message:
      error instanceof Error && error.message.trim().length > 0
        ? error.message
        : getErrorMessage(error, defaultMessage),
  }
}
