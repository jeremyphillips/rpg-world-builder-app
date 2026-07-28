import type {
  CompleteCampaignOnboardingInput,
  CompleteCampaignOnboardingResult,
  CreateCharacterInput,
} from '@rpg/contracts'

import { completeCampaignCharacterAssignment } from './participation/character-assignment/complete-campaign-character-assignment.lib'
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

  return completeCampaignCharacterAssignment({
    userId: input.userId,
    campaignId: input.campaignId,
    membershipId: context.membershipId,
    characterSource:
      input.characterSource.kind === 'new'
        ? { kind: 'new', characterInput: input.characterSource.character }
        : { kind: 'existing', characterId: input.characterSource.characterId },
    invitePolicy: { linkedInviteId: linkedInvite?.id },
  })
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
