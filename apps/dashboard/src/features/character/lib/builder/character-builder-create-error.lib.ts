import {
  formatCampaignInviteUnavailableMessage,
  getApiValidationIssues,
  getCharacterBuilderChromeMessages,
  getErrorMessage,
  isCampaignPcOnboardingBuildContext,
  isCharacterBuildFinalizationError,
  resolveCampaignCharacterAssignmentError,
  resolveCharacterBuilderChromeVariant,
  resolveCharacterBuildStepForIssuePath,
  type ApiValidationIssue,
  type CampaignInviteUnavailableReason,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterCampaignBlockingIssue,
  type CharacterCampaignWarning,
} from '@rpg/contracts'
import type {
  CharacterBuilderStepId,
  CharacterBuildValidationIssue,
} from '@rpg/contracts/rpg/character-builder'

export type BuilderCreateFailureOutcome =
  | {
      kind: 'validation'
      issues: CharacterBuildValidationIssue[]
      validationAlertHeading?: string
    }
  | {
      kind: 'campaign_eligibility'
      blockingIssues: CharacterCampaignBlockingIssue[]
      warnings: CharacterCampaignWarning[]
    }
  | { kind: 'invite_unavailable'; reason: CampaignInviteUnavailableReason }
  | { kind: 'create_error'; message: string }

export function validationIssueStepIds(
  issues: readonly CharacterBuildValidationIssue[],
): CharacterBuilderStepId[] {
  return issues.flatMap((issue) => (issue.stepId ? [issue.stepId] : []))
}

export type ApplyValidationIssuesOptions = {
  heading?: string
}

export type BuilderCreateFailureHandlers = {
  applyValidationIssues: (
    issues: CharacterBuildValidationIssue[],
    options?: ApplyValidationIssuesOptions,
  ) => void
  patchDraft: (patch: Partial<CharacterBuilderDraft>) => void
  setCampaignEligibilityError: (error: {
    blockingIssues: CharacterCampaignBlockingIssue[]
    warnings: CharacterCampaignWarning[]
  }) => void
  setCreateError: (message: string) => void
  onInviteUnavailable?: (reason: CampaignInviteUnavailableReason) => void
}

function resolveCreateValidationAlertHeading(context: CharacterBuildContext): string {
  const variant = resolveCharacterBuilderChromeVariant(context)
  return getCharacterBuilderChromeMessages(variant).createValidationFailureHeading
}

function mapApiValidationIssuesToBuilderIssues(
  issues: ApiValidationIssue[],
): CharacterBuildValidationIssue[] {
  return issues.map((issue) => {
    const stepId = resolveCharacterBuildStepForIssuePath(issue.path)
    return {
      code: issue.code,
      message: issue.message,
      path: issue.path.length > 0 ? issue.path : undefined,
      source: 'api',
      ...(stepId ? { stepId } : {}),
    }
  })
}

export function applyBuilderCreateFailure(
  outcome: BuilderCreateFailureOutcome,
  handlers: BuilderCreateFailureHandlers,
): void {
  switch (outcome.kind) {
    case 'validation':
      handlers.applyValidationIssues(outcome.issues, {
        heading: outcome.validationAlertHeading,
      })
      return
    case 'campaign_eligibility':
      handlers.setCampaignEligibilityError({
        blockingIssues: outcome.blockingIssues,
        warnings: outcome.warnings,
      })
      handlers.patchDraft({ currentStepId: 'review' })
      return
    case 'invite_unavailable':
      if (handlers.onInviteUnavailable) {
        handlers.onInviteUnavailable(outcome.reason)
      } else {
        handlers.setCreateError(formatCampaignInviteUnavailableMessage(outcome.reason))
      }
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
  const apiValidationIssues = getApiValidationIssues(error)
  if (apiValidationIssues && apiValidationIssues.length > 0) {
    return {
      kind: 'validation',
      issues: mapApiValidationIssuesToBuilderIssues(apiValidationIssues),
      validationAlertHeading: resolveCreateValidationAlertHeading(context),
    }
  }

  if (isCharacterBuildFinalizationError(error)) {
    return { kind: 'validation', issues: error.validationIssues }
  }

  if (isCampaignPcOnboardingBuildContext(context)) {
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
