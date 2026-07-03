import { ROUTES } from '@/app/routes'

import type { CampaignSettingId } from './availability'

export const CHARACTER_CONFIGURATION_CONFIG_ID = 'character-configuration'

export const CAMPAIGN_SETTINGS_REGISTRY = {
  'characterCreation.subclasses.enabled': {
    configId: CHARACTER_CONFIGURATION_CONFIG_ID,
    sectionId: 'subclasses',
    label: 'Subclasses',
  },
  'characterCreation.multiclassing.enabled': {
    configId: CHARACTER_CONFIGURATION_CONFIG_ID,
    sectionId: 'multiclassing',
    label: 'Multiclassing',
  },
} as const satisfies Record<
  CampaignSettingId,
  { configId: string; sectionId: string; label: string }
>

export function campaignSettingHref(campaignId: string, settingId: CampaignSettingId): string {
  const entry = CAMPAIGN_SETTINGS_REGISTRY[settingId]
  return `${ROUTES.homebrew.rulesConfig(campaignId, entry.configId)}#${entry.sectionId}`
}
