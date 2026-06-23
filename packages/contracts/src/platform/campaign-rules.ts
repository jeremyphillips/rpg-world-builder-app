import type { CampaignSettings } from './campaign'
import { MAX_CHARACTER_LEVEL } from '../primitives/level'

export type ResolvedCampaignRules = {
  maxCharacterLevel: number
}

/** Effective max character level — sparse override or system default (20). */
export function resolveMaxCharacterLevel(settings?: CampaignSettings): number {
  return settings?.ruleOverrides?.maxCharacterLevel ?? MAX_CHARACTER_LEVEL
}

export function resolveCampaignRules(settings?: CampaignSettings): ResolvedCampaignRules {
  return {
    maxCharacterLevel: resolveMaxCharacterLevel(settings),
  }
}
