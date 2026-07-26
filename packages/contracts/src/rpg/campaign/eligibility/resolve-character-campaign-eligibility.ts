import type { CampaignCharacterParticipation } from '../campaign-character-participation'
import type { Character } from '../../runtime/character/sheet'
import type { ContentViewer } from '../../content/lib/content-viewer-access'
import {
  sortBlockingIssuesByPriority,
  type CharacterCampaignEligibility,
} from './character-campaign-eligibility'
import type { CampaignContentEligibilityEntry } from './resolve-character-content-eligibility'
import { resolveCharacterContentEligibility } from './resolve-character-content-eligibility'
import { resolveCharacterParticipationEligibility } from './resolve-character-participation-eligibility'
import { resolveCharacterStartingLevelEligibility } from './resolve-character-starting-level-eligibility'
import { resolveCharacterStructuralEligibility } from './resolve-character-structural-eligibility'

export type ResolveCharacterCampaignEligibilityInput = {
  character: Character
  userId: string
  campaignId: string
  startingLevel: number
  existingOpenParticipation?: Pick<CampaignCharacterParticipation, 'campaignId'> | null
  conflictingCampaignName?: string
  campaignContentById: ReadonlyMap<string, CampaignContentEligibilityEntry>
  viewer: ContentViewer
}

export function resolveCharacterCampaignEligibility({
  character,
  userId,
  campaignId,
  startingLevel,
  existingOpenParticipation,
  conflictingCampaignName,
  campaignContentById,
  viewer,
}: ResolveCharacterCampaignEligibilityInput): CharacterCampaignEligibility {
  const participation = resolveCharacterParticipationEligibility({
    character,
    userId,
    campaignId,
    existingOpenParticipation,
    conflictingCampaignName,
  })

  if (participation.blockingIssues.length > 0) {
    return {
      eligible: false,
      blockingIssues: sortBlockingIssuesByPriority(participation.blockingIssues),
      warnings: [],
    }
  }

  const structural = resolveCharacterStructuralEligibility({ character })
  if (structural.blockingIssues.length > 0) {
    return {
      eligible: false,
      blockingIssues: sortBlockingIssuesByPriority(structural.blockingIssues),
      warnings: [],
    }
  }

  const level = resolveCharacterStartingLevelEligibility({ character, startingLevel })
  const content = resolveCharacterContentEligibility({
    character,
    campaignContentById,
    viewer,
  })

  const blockingIssues = sortBlockingIssuesByPriority([
    ...level.blockingIssues,
    ...content.blockingIssues,
  ])

  return {
    eligible: blockingIssues.length === 0,
    blockingIssues,
    warnings: content.warnings,
  }
}
