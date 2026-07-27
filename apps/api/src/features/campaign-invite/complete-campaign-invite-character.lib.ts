import type {
  CampaignInvite,
  CharacterEligibilitySubject,
  CompleteCampaignInviteResult,
  CreateCharacterInput,
  PcCharacter,
} from '@rpg/contracts'
import {
  characterForEligibilityCheck,
  createCharacterInputSchema,
  projectCharacterEligibilitySubjectFromCharacter,
  projectCharacterEligibilitySubjectFromCreateInput,
  resolveCharacterCampaignEligibility,
} from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { findCampaignById } from '../campaign/find-campaign-by-id'
import { findOpenParticipationForCharacter } from '../campaign/participation/campaign-character-participation.repository'
import { findCharacterForUser } from '../character/character.service'
import {
  executeExistingCharacterInviteCompletion,
  executeNewCharacterInviteCompletion,
} from './complete-campaign-invite-completion.lib'
import { resolveCampaignInviteCompletionContext } from './resolve-campaign-invite-completion-context.lib'
import { resolveCampaignInviteEligibilityContext } from './resolve-campaign-invite-eligibility-context.lib'
import type { CampaignInviteEligibilityContext } from './resolve-campaign-invite-eligibility-context.lib'
import type { InviteCompletionWriteReceipt } from './complete-campaign-invite-receipt'

export type { InviteCompletionWriteReceipt }

export type CompletionCandidate =
  | {
      kind: 'new'
      parsedInput: CreateCharacterInput
      eligibilitySubject: CharacterEligibilitySubject
    }
  | {
      kind: 'existing'
      character: PcCharacter
      eligibilitySubject: CharacterEligibilitySubject
    }

export async function resolveNewCharacterCandidate({
  acceptedInvite,
  userId,
  characterCreateInput,
}: {
  acceptedInvite: CampaignInvite
  userId: string
  characterCreateInput: CreateCharacterInput
}): Promise<Extract<CompletionCandidate, { kind: 'new' }>> {
  const parsedInput = createCharacterInputSchema.parse(characterCreateInput)
  const campaign = await findCampaignById(acceptedInvite.campaignId)

  if (!campaign) {
    throw new HttpError(500, 'integrity_error', 'Campaign for this invitation no longer exists.')
  }

  if (parsedInput.rulesetId !== campaign.rulesetId) {
    throw HttpError.badRequest('rulesetId must match the campaign ruleset.')
  }

  if (parsedInput.characterType !== 'pc') {
    throw HttpError.badRequest('Only player characters can be created for campaign onboarding.')
  }

  return {
    kind: 'new',
    parsedInput,
    eligibilitySubject: projectCharacterEligibilitySubjectFromCreateInput(parsedInput, userId),
  }
}

export async function resolveExistingCharacterCandidate({
  userId,
  characterId,
}: {
  userId: string
  characterId: string
}): Promise<Extract<CompletionCandidate, { kind: 'existing' }>> {
  const character = await findCharacterForUser(characterId, userId)
  if (!character || character.characterType !== 'pc') {
    throw new HttpError(404, 'not_found', 'Character not found.')
  }

  return {
    kind: 'existing',
    character,
    eligibilitySubject: projectCharacterEligibilitySubjectFromCharacter(character),
  }
}

export async function assertNewCharacterBuildEligible({
  acceptedInvite,
  userId,
  candidate,
  eligibilityContext,
}: {
  acceptedInvite: CampaignInvite
  userId: string
  candidate: Extract<CompletionCandidate, { kind: 'new' }>
  eligibilityContext: CampaignInviteEligibilityContext
}): Promise<void> {
  const eligibility = resolveCharacterCampaignEligibility({
    character: characterForEligibilityCheck(candidate.eligibilitySubject),
    userId,
    campaignId: acceptedInvite.campaignId,
    startingLevel: eligibilityContext.startingLevel,
    existingOpenParticipation: null,
    campaignContentById: eligibilityContext.campaignContentById,
    viewer: { kind: 'none' },
  })

  if (!eligibility.eligible) {
    throw new HttpError(
      422,
      'ineligible_character',
      'Character build is not eligible for this campaign.',
      {
        blockingIssues: eligibility.blockingIssues,
      },
    )
  }
}

export async function assertExistingCharacterEligible({
  acceptedInvite,
  userId,
  candidate,
  eligibilityContext,
}: {
  acceptedInvite: CampaignInvite
  userId: string
  candidate: Extract<CompletionCandidate, { kind: 'existing' }>
  eligibilityContext: CampaignInviteEligibilityContext
}): Promise<void> {
  const existingOpenParticipation = await findOpenParticipationForCharacter(candidate.character.id)
  let conflictingCampaignName: string | undefined
  if (
    existingOpenParticipation &&
    existingOpenParticipation.campaignId !== acceptedInvite.campaignId
  ) {
    const conflictingCampaign = await findCampaignById(existingOpenParticipation.campaignId)
    conflictingCampaignName = conflictingCampaign?.identity.name
  }

  const eligibility = resolveCharacterCampaignEligibility({
    character: candidate.character,
    userId,
    campaignId: acceptedInvite.campaignId,
    startingLevel: eligibilityContext.startingLevel,
    existingOpenParticipation,
    conflictingCampaignName,
    campaignContentById: eligibilityContext.campaignContentById,
    viewer: { kind: 'pc', characterIds: [candidate.character.id] },
  })

  if (!eligibility.eligible) {
    throw new HttpError(
      422,
      'ineligible_character',
      'Character is not eligible for this campaign.',
      {
        blockingIssues: eligibility.blockingIssues,
      },
    )
  }
}

export async function completeCampaignInviteWithCharacter(input: {
  inviteId: string
  userId: string
  characterSource:
    | { kind: 'new'; characterCreateInput: CreateCharacterInput }
    | { kind: 'existing'; characterId: string }
}): Promise<CompleteCampaignInviteResult> {
  const contextResult = await resolveCampaignInviteCompletionContext({
    inviteId: input.inviteId,
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
  const candidate =
    input.characterSource.kind === 'new'
      ? await resolveNewCharacterCandidate({
          acceptedInvite: context.acceptedInvite,
          userId: input.userId,
          characterCreateInput: input.characterSource.characterCreateInput,
        })
      : await resolveExistingCharacterCandidate({
          userId: input.userId,
          characterId: input.characterSource.characterId,
        })

  const eligibilityContext = await resolveCampaignInviteEligibilityContext(
    context.acceptedInvite.campaignId,
  )

  if (candidate.kind === 'new') {
    await assertNewCharacterBuildEligible({
      acceptedInvite: context.acceptedInvite,
      userId: input.userId,
      candidate,
      eligibilityContext,
    })

    return executeNewCharacterInviteCompletion({
      inviteId: context.invite.id,
      campaignId: context.acceptedInvite.campaignId,
      membershipId: context.membershipId,
      userId: input.userId,
      parsedInput: candidate.parsedInput,
    })
  }

  await assertExistingCharacterEligible({
    acceptedInvite: context.acceptedInvite,
    userId: input.userId,
    candidate,
    eligibilityContext,
  })

  await executeExistingCharacterInviteCompletion({
    inviteId: context.invite.id,
    campaignId: context.acceptedInvite.campaignId,
    membershipId: context.membershipId,
    characterId: candidate.character.id,
  })

  return { campaignId: context.invite.campaignId, characterId: candidate.character.id }
}
