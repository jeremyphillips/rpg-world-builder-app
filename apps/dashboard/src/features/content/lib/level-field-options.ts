import {
  buildGroupedLevelOptions,
  DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES,
  MAX_CHARACTER_LEVEL,
  type ResolvedCampaignRules,
} from '@rpg/contracts'
import type { SelectFieldConfig } from '@rpg/ui/form'
import { type FieldOption, type SelectFieldOptionListItem } from '@rpg/ui/form'

import type { ContentFormCtx } from './content-form-registry'

type LevelSelectDigits = NonNullable<SelectFieldConfig['digits']>

export function defaultCampaignRules(): ResolvedCampaignRules {
  return {
    maxCharacterLevel: MAX_CHARACTER_LEVEL,
    standardMaxCharacterLevel: MAX_CHARACTER_LEVEL,
    allowedCharacterCreatureTypes: [...DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES],
  }
}

export function campaignRulesFromCtx(ctx?: ContentFormCtx): ResolvedCampaignRules {
  return ctx?.campaignRules ?? defaultCampaignRules()
}

export function effectiveMaxFromCtx(ctx?: ContentFormCtx): number {
  return campaignRulesFromCtx(ctx).maxCharacterLevel
}

/** Strips the `Level ` prefix so digit-sized selects show `1`, `2`, … in the trigger. */
function compactLevelLabel(label: string): string {
  return label.replace(/^Level /, '')
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

/** Flat level options for controls that do not support option groups (e.g. chips). */
export function getFlatLevelFieldOptions(ctx?: ContentFormCtx): FieldOption[] {
  const groups = buildGroupedLevelOptions(campaignRulesFromCtx(ctx))
  return groups.flatMap((group) => group.options)
}

/**
 * Numeric-only level labels for digit-sized `select` fields. Prefer over
 * `getLevelFieldOptions` when the trigger uses `digits` — verbose `Level N`
 * labels do not fit ch-based widths.
 */
export function getCompactLevelFieldOptions(ctx?: ContentFormCtx): FieldOption[] {
  return getFlatLevelFieldOptions(ctx).map((option) => ({
    ...option,
    label: compactLevelLabel(option.label),
  }))
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

/**
 * Grouped level options with numeric-only labels — use with `digits` on standalone
 * or row level selects (spellcasting level, resource entries, …).
 */
export function getCompactLevelFieldOptionsGrouped(
  ctx?: ContentFormCtx,
): SelectFieldOptionListItem[] {
  const rules = campaignRulesFromCtx(ctx)
  const groups = buildGroupedLevelOptions(rules)

  if (!rules.extendedProgression) {
    return (groups[0]?.options ?? []).map((option) => ({
      ...option,
      label: compactLevelLabel(option.label),
    }))
  }

  return groups.map((group) => ({
    kind: 'group' as const,
    label: group.label,
    options: group.options.map((option) => ({
      ...option,
      label: compactLevelLabel(option.label),
    })),
  }))
}
