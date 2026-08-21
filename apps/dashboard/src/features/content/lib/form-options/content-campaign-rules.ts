import {
  DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES,
  defaultMulticlassingRules,
  defaultSubclassingRules,
  DEFAULT_STANDARD_ARRAY,
  MAX_CHARACTER_LEVEL,
  type ResolvedCampaignRules,
} from '@rpg/contracts'

import type { ContentFormCtx } from '../forms/registry/content-form-registry'

export function defaultCampaignRules(): ResolvedCampaignRules {
  return {
    maxCharacterLevel: MAX_CHARACTER_LEVEL,
    standardMaxCharacterLevel: MAX_CHARACTER_LEVEL,
    allowedCharacterCreatureTypes: [...DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES],
    multiclassing: defaultMulticlassingRules(),
    subclassing: defaultSubclassingRules(),
    standardArray: [...DEFAULT_STANDARD_ARRAY],
  }
}

export function campaignRulesFromCtx(ctx?: ContentFormCtx): ResolvedCampaignRules {
  return ctx?.campaignRules ?? defaultCampaignRules()
}

export function effectiveMaxFromCtx(ctx?: ContentFormCtx): number {
  return campaignRulesFromCtx(ctx).maxCharacterLevel
}
