import {
  CAMPAIGN_MANAGE_ROLES,
  type CampaignManageRole,
  type CampaignRole,
  type VocabularyOptionStatus,
} from '@rpg/contracts'

type VocabularySearchOption = {
  status: VocabularyOptionStatus
}

export function isSearchViewerManager(viewerRole: CampaignRole): boolean {
  return CAMPAIGN_MANAGE_ROLES.includes(viewerRole as CampaignManageRole)
}

/** Managers see disabled vocabulary in search; players only see active options. */
export function filterVocabularyOptionsForSearch<T extends VocabularySearchOption>(
  options: readonly T[],
  viewerRole: CampaignRole,
): T[] {
  if (isSearchViewerManager(viewerRole)) {
    return [...options]
  }

  return options.filter((option) => option.status === 'active')
}

export function projectVocabularySearchAvailability(
  status: VocabularyOptionStatus,
): { campaignAvailable: false } | Record<string, never> {
  return status === 'disabled' ? { campaignAvailable: false as const } : {}
}
