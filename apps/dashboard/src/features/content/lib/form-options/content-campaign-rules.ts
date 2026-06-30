import {
  DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES,
  defaultMulticlassingRules,
  MAX_CHARACTER_LEVEL,
  type ResolvedCampaignRules,
} from '@rpg/contracts'

import type { ContentFormCtx } from '../forms/content-form-registry'

export function defaultCampaignRules(): ResolvedCampaignRules {
  return {
    maxCharacterLevel: MAX_CHARACTER_LEVEL,
    standardMaxCharacterLevel: MAX_CHARACTER_LEVEL,
    allowedCharacterCreatureTypes: [...DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES],
    multiclassing: defaultMulticlassingRules(),
  }
}

export function campaignRulesFromCtx(ctx?: ContentFormCtx): ResolvedCampaignRules {
  return ctx?.campaignRules ?? defaultCampaignRules()
}

export function effectiveMaxFromCtx(ctx?: ContentFormCtx): number {
  return campaignRulesFromCtx(ctx).maxCharacterLevel
}
