import {
  buildGroupedLevelOptions,
  MAX_CHARACTER_LEVEL,
  type ResolvedCampaignRules,
} from '@rpg/contracts'
import { type FieldOption, type SelectFieldOptionListItem } from '@rpg/ui/form'

import type { ContentFormCtx } from './content-form-registry'

export function defaultCampaignRules(): ResolvedCampaignRules {
  return {
    maxCharacterLevel: MAX_CHARACTER_LEVEL,
    standardMaxCharacterLevel: MAX_CHARACTER_LEVEL,
  }
}

export function campaignRulesFromCtx(ctx?: ContentFormCtx): ResolvedCampaignRules {
  return ctx?.campaignRules ?? defaultCampaignRules()
}

export function effectiveMaxFromCtx(ctx?: ContentFormCtx): number {
  return campaignRulesFromCtx(ctx).maxCharacterLevel
}

/** Flat level options for controls that do not support option groups (e.g. chips). */
export function getFlatLevelFieldOptions(ctx?: ContentFormCtx): FieldOption[] {
  const groups = buildGroupedLevelOptions(campaignRulesFromCtx(ctx))
  return groups.flatMap((group) => group.options)
}

/** Level select options — flat or grouped when extended progression is active. */
export function getLevelFieldOptions(ctx?: ContentFormCtx): SelectFieldOptionListItem[] {
  const rules = campaignRulesFromCtx(ctx)
  const groups = buildGroupedLevelOptions(rules)

  if (!rules.extendedProgression) {
    return groups[0]?.options ?? []
  }

  return groups.map((group) => ({
    kind: 'group' as const,
    label: group.label,
    options: group.options,
  }))
}
