import {
  buildGroupedLevelOptions,
  DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES,
  defaultMulticlassingRules,
  MAX_CHARACTER_LEVEL,
  type BuildGroupedLevelOptionsConfig,
  type ResolvedCampaignRules,
} from '@rpg/contracts'
import type { SelectFieldConfig } from '@rpg/ui/form'
import { type FieldOption, type SelectFieldOptionListItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../forms/content-form-registry'

type LevelSelectDigits = NonNullable<SelectFieldConfig['digits']>

export type LevelFieldOptionsConfig = BuildGroupedLevelOptionsConfig

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

/** Digit slot count for level selects from campaign max level (1–9 → 1, 10–99 → 2, …). */
export function levelSelectDigits(ctx?: ContentFormCtx): LevelSelectDigits {
  const max = effectiveMaxFromCtx(ctx)
  if (max <= 9) return 1
  if (max <= 99) return 2
  return 3
}

/** Digit width for hit-die labels (`d6` … `d12`). */
export const HIT_DIE_SELECT_DIGITS = 3 satisfies LevelSelectDigits

function flatLevelOptions(
  ctx: ContentFormCtx | undefined,
  config: LevelFieldOptionsConfig | undefined,
): FieldOption[] {
  const groups = buildGroupedLevelOptions(campaignRulesFromCtx(ctx), config)
  return groups.flatMap((group) => group.options)
}

function groupedLevelOptions(
  ctx: ContentFormCtx | undefined,
  config: LevelFieldOptionsConfig | undefined,
): SelectFieldOptionListItem[] {
  const rules = campaignRulesFromCtx(ctx)
  const showTierLabels = config?.showTierLabels ?? true
  const groups = buildGroupedLevelOptions(rules, config)

  if (!rules.extendedProgression || !showTierLabels) {
    return groups.flatMap((group) => group.options)
  }

  return groups.map((group) => ({
    kind: 'group' as const,
    label: group.label,
    options: group.options,
  }))
}

export function getLevelFieldOptions(
  ctx?: ContentFormCtx,
  config?: LevelFieldOptionsConfig & { showTierLabels?: true },
): SelectFieldOptionListItem[]
export function getLevelFieldOptions(
  ctx: ContentFormCtx | undefined,
  config: { showTierLabels: false },
): FieldOption[]
export function getLevelFieldOptions(
  ctx?: ContentFormCtx,
  config?: LevelFieldOptionsConfig,
): SelectFieldOptionListItem[] | FieldOption[] {
  const showTierLabels = config?.showTierLabels ?? true
  const rules = campaignRulesFromCtx(ctx)

  if (!rules.extendedProgression || !showTierLabels) {
    return flatLevelOptions(ctx, config)
  }

  return groupedLevelOptions(ctx, config)
}
