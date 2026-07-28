import type { CharacterEligibilitySubject, CreateCharacterInput, PcCharacter } from '@rpg/contracts'
import {
  createCharacterInputSchema,
  projectCharacterEligibilitySubjectFromCharacter,
  projectCharacterEligibilitySubjectFromCreateInput,
  resolveCharacterCampaignEligibility,
} from '@rpg/contracts'

import { HttpError } from '../../../../lib/http-error'
import { findCampaignById } from '../../find-campaign-by-id'
import { findOpenParticipationForCharacter } from '../campaign-character-participation.repository'
import { findCharacterForUser } from '../../../character'
import { failCampaignCharacterAssignment } from './campaign-character-assignment-failure.lib'
import { zodIssuesToBuildValidationIssues } from './map-build-validation-issues.lib'
import type { CampaignCharacterEligibilityContext } from './resolve-campaign-character-eligibility-context.lib'

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
  campaignId,
  userId,
  characterCreateInput,
}: {
  campaignId: string
  userId: string
  characterCreateInput: CreateCharacterInput
}): Promise<Extract<CompletionCandidate, { kind: 'new' }>> {
  const parsed = createCharacterInputSchema.safeParse(characterCreateInput)
  if (!parsed.success) {
    failCampaignCharacterAssignment({
      kind: 'build_invalid',
      issues: zodIssuesToBuildValidationIssues(parsed.error),
    })
  }

  const parsedInput = parsed.data
  const campaign = await findCampaignById(campaignId)

  if (!campaign) {
    throw new HttpError(500, 'integrity_error', 'Campaign for this invitation no longer exists.')
  }

  if (parsedInput.rulesetId !== campaign.rulesetId) {
    failCampaignCharacterAssignment({
      kind: 'build_invalid',
      issues: [
        {
          code: 'ruleset_mismatch',
          message: 'rulesetId must match the campaign ruleset.',
          path: 'rulesetId',
        },
      ],
    })
  }

  if (parsedInput.characterType !== 'pc') {
    failCampaignCharacterAssignment({
      kind: 'build_invalid',
      issues: [
        {
          code: 'invalid_character_type',
          message: 'Only player characters can be created for campaign onboarding.',
          path: 'characterType',
        },
      ],
    })
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
  campaignId,
  userId,
  candidate,
  eligibilityContext,
}: {
  campaignId: string
  userId: string
  candidate: Extract<CompletionCandidate, { kind: 'new' }>
  eligibilityContext: CampaignCharacterEligibilityContext
}): Promise<void> {
  const eligibility = resolveCharacterCampaignEligibility({
    subject: candidate.eligibilitySubject,
    userId,
    campaignId,
    startingLevel: eligibilityContext.startingLevel,
    existingOpenParticipation: null,
    contentIndex: eligibilityContext.contentIndex,
    viewer: { kind: 'none' },
  })

  if (!eligibility.eligible) {
    failCampaignCharacterAssignment({
      kind: 'campaign_ineligible',
      blockingIssues: eligibility.blockingIssues,
      warnings: eligibility.warnings,
    })
  }
}

export async function assertExistingCharacterEligible({
  campaignId,
  userId,
  candidate,
  eligibilityContext,
}: {
  campaignId: string
  userId: string
  candidate: Extract<CompletionCandidate, { kind: 'existing' }>
  eligibilityContext: CampaignCharacterEligibilityContext
}): Promise<void> {
  const existingOpenParticipation = await findOpenParticipationForCharacter(candidate.character.id)
  let conflictingCampaignName: string | undefined
  if (existingOpenParticipation && existingOpenParticipation.campaignId !== campaignId) {
    const conflictingCampaign = await findCampaignById(existingOpenParticipation.campaignId)
    conflictingCampaignName = conflictingCampaign?.identity.name
  }

  const eligibility = resolveCharacterCampaignEligibility({
    subject: candidate.eligibilitySubject,
    userId,
    campaignId,
    startingLevel: eligibilityContext.startingLevel,
    existingOpenParticipation,
    conflictingCampaignName,
    contentIndex: eligibilityContext.contentIndex,
    viewer: { kind: 'pc', characterIds: [candidate.character.id] },
  })

  if (!eligibility.eligible) {
    failCampaignCharacterAssignment({
      kind: 'campaign_ineligible',
      blockingIssues: eligibility.blockingIssues,
      warnings: eligibility.warnings,
    })
  }
}
