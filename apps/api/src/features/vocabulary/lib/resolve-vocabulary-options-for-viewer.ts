import {
  CAMPAIGN_MANAGE_ROLES,
  type CampaignManageRole,
  type CampaignRole,
  type VocabularyOptionStatus,
} from '@rpg/contracts'

type VocabularyViewerOption = {
  status: VocabularyOptionStatus
}

export function isVocabularyViewerManager(viewerRole: CampaignRole): boolean {
  return CAMPAIGN_MANAGE_ROLES.includes(viewerRole as CampaignManageRole)
}

/**
 * Vocabulary rows visible to a campaign viewer.
 * Managers see disabled options; non-managers receive active options only.
 */
export function resolveVocabularyOptionsForViewer<T extends VocabularyViewerOption>(
  options: readonly T[],
  viewerRole: CampaignRole,
): T[] {
  if (isVocabularyViewerManager(viewerRole)) {
    return [...options]
  }

  return options.filter((option) => option.status === 'active')
}
