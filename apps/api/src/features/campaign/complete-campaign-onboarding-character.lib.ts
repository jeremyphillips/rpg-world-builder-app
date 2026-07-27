import type {
  CompleteCampaignOnboardingInput,
  CompleteCampaignOnboardingResult,
  CreateCharacterInput,
} from '@rpg/contracts'

import {
  assertExistingCharacterEligible,
  assertNewCharacterBuildEligible,
  resolveExistingCharacterCandidate,
  resolveNewCharacterCandidate,
} from '../campaign-invite/complete-campaign-invite-character.lib'
import { resolveCampaignInviteEligibilityContext } from '../campaign-invite/resolve-campaign-invite-eligibility-context.lib'
import {
  executeExistingCharacterOnboardingCompletion,
  executeNewCharacterOnboardingCompletion,
} from './complete-campaign-onboarding-completion.lib'
import { resolveCampaignOnboardingCompletionContext } from './resolve-campaign-onboarding-completion-context.lib'
import { resolveLinkedAcceptedInviteForOnboardingComplete } from './resolve-linked-onboarding-invite.lib'

export async function completeCampaignOnboardingWithCharacter(input: {
  campaignId: string
  userId: string
  userEmail: string
  characterSource:
    | { kind: 'new'; character: CreateCharacterInput }
    | { kind: 'existing'; characterId: string }
}): Promise<CompleteCampaignOnboardingResult> {
  const contextResult = await resolveCampaignOnboardingCompletionContext({
    campaignId: input.campaignId,
    userId: input.userId,
    characterSource:
      input.characterSource.kind === 'existing'
        ? { kind: 'existing', characterId: input.characterSource.characterId }
        : { kind: 'new' },
  })

  if (contextResult.kind === 'idempotent') {
    return contextResult.result
  }

  const { context } = contextResult
  const linkedInvite = await resolveLinkedAcceptedInviteForOnboardingComplete({
    campaignId: input.campaignId,
    userId: input.userId,
    userEmail: input.userEmail,
  })

  const candidate =
    input.characterSource.kind === 'new'
      ? await resolveNewCharacterCandidate({
          campaignId: input.campaignId,
          userId: input.userId,
          characterCreateInput: input.characterSource.character,
        })
      : await resolveExistingCharacterCandidate({
          userId: input.userId,
          characterId: input.characterSource.characterId,
        })

  const eligibilityContext = await resolveCampaignInviteEligibilityContext(input.campaignId)

  if (candidate.kind === 'new') {
    await assertNewCharacterBuildEligible({
      campaignId: input.campaignId,
      userId: input.userId,
      candidate,
      eligibilityContext,
    })

    return executeNewCharacterOnboardingCompletion({
      campaignId: input.campaignId,
      membershipId: context.membershipId,
      userId: input.userId,
      parsedInput: candidate.parsedInput,
      linkedInviteId: linkedInvite?.id,
    })
  }

  await assertExistingCharacterEligible({
    campaignId: input.campaignId,
    userId: input.userId,
    candidate,
    eligibilityContext,
  })

  await executeExistingCharacterOnboardingCompletion({
    campaignId: input.campaignId,
    membershipId: context.membershipId,
    characterId: candidate.character.id,
    linkedInviteId: linkedInvite?.id,
  })

  return { campaignId: input.campaignId, characterId: candidate.character.id }
}

export async function completeCampaignOnboarding(
  input: CompleteCampaignOnboardingInput & {
    campaignId: string
    userId: string
    userEmail: string
  },
): Promise<CompleteCampaignOnboardingResult> {
  if (input.source === 'existing') {
    return completeCampaignOnboardingWithCharacter({
      campaignId: input.campaignId,
      userId: input.userId,
      userEmail: input.userEmail,
      characterSource: { kind: 'existing', characterId: input.characterId },
    })
  }

  return completeCampaignOnboardingWithCharacter({
    campaignId: input.campaignId,
    userId: input.userId,
    userEmail: input.userEmail,
    characterSource: { kind: 'new', character: input.character },
  })
}
