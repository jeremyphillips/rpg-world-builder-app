import type { CampaignCharacterParticipation } from '../../campaign/campaign-character-participation'
import type { CharacterEligibilitySubject } from './character-eligibility-subject'
import type { ContentViewer } from '../../campaign/lib/campaign-content-viewer'
import {
  sortBlockingIssuesByPriority,
  type CharacterCampaignEligibility,
} from '../../campaign/character-eligibility-contracts'
import type { CampaignContentEligibilityIndex } from './campaign-content-eligibility-index'
import { resolveCharacterContentEligibility } from './resolve-character-content-eligibility'
import { resolveCharacterParticipationEligibility } from './resolve-character-participation-eligibility'
import { resolveCharacterStartingLevelEligibility } from './resolve-character-starting-level-eligibility'
import { resolveCharacterStructuralEligibility } from './resolve-character-structural-eligibility'

export type ResolveCharacterCampaignEligibilityInput = {
  subject: CharacterEligibilitySubject
  userId: string
  campaignId: string
  startingLevel: number
  existingOpenParticipation?: Pick<CampaignCharacterParticipation, 'campaignId'> | null
  conflictingCampaignName?: string
  contentIndex: CampaignContentEligibilityIndex
  viewer: ContentViewer
}

export function resolveCharacterCampaignEligibility({
  subject,
  userId,
  campaignId,
  startingLevel,
  existingOpenParticipation,
  conflictingCampaignName,
  contentIndex,
  viewer,
}: ResolveCharacterCampaignEligibilityInput): CharacterCampaignEligibility {
  const participation = resolveCharacterParticipationEligibility({
    subject,
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

  const structural = resolveCharacterStructuralEligibility({ subject })
  if (structural.blockingIssues.length > 0) {
    return {
      eligible: false,
      blockingIssues: sortBlockingIssuesByPriority(structural.blockingIssues),
      warnings: [],
    }
  }

  const level = resolveCharacterStartingLevelEligibility({ subject, startingLevel })
  const content = resolveCharacterContentEligibility({
    subject,
    contentIndex,
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
