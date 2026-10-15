import type { CampaignLevelZeroNpcsPatch } from '@rpg/contracts'

import type { ArmorProficiencyGrantMode } from '@/lib/forms/grant-sets/armor-proficiency-grant-mode.lib'
import {
  hasNonEmptyGrantSet,
  proficiencyGrantSetsEqual,
  type ProficiencyGrantSetBuckets,
} from '@/lib/forms/grant-sets/proficiency-grant-set-mode.lib'

export type LevelZeroArmorSparsePatchGrant = NonNullable<
  CampaignLevelZeroNpcsPatch['armorProficiencies']
>

function resolveEmptyArmorNoneModePatch(
  projected: LevelZeroArmorSparsePatchGrant,
  storedOverride: LevelZeroArmorSparsePatchGrant | undefined,
  baseline: ProficiencyGrantSetBuckets,
): LevelZeroArmorSparsePatchGrant | undefined {
  if (storedOverride !== undefined && !hasNonEmptyGrantSet(storedOverride)) {
    return undefined
  }
  if (storedOverride !== undefined && hasNonEmptyGrantSet(storedOverride)) {
    return projected
  }
  return hasNonEmptyGrantSet(baseline) ? projected : undefined
}

function resolveEmptyArmorCategoriesOrSpecificPatch(
  projected: LevelZeroArmorSparsePatchGrant,
  storedOverride: LevelZeroArmorSparsePatchGrant | undefined,
  baseline: ProficiencyGrantSetBuckets,
): LevelZeroArmorSparsePatchGrant | undefined {
  if (storedOverride !== undefined) {
    return projected
  }
  if (hasNonEmptyGrantSet(baseline) && !proficiencyGrantSetsEqual(projected, baseline)) {
    return projected
  }
  return undefined
}

/**
 * Sparse PATCH armor proficiencies:
 * - Omit when projected grant matches the stored override (unchanged save).
 * - Include non-empty projected grants (update).
 * - When mode is none, distinguish omit vs explicit empty override vs clearing a stored override.
 */
export function resolveLevelZeroArmorProficienciesSparsePatch(params: {
  mode: ArmorProficiencyGrantMode
  projected: LevelZeroArmorSparsePatchGrant
  /** Undefined when no `armorProficiencies` key exists on the stored sparse patch. */
  storedOverride: LevelZeroArmorSparsePatchGrant | undefined
  /** Grant inherited when the stored override is absent (campaign default today is empty). */
  baseline: ProficiencyGrantSetBuckets
}): LevelZeroArmorSparsePatchGrant | undefined {
  const { mode, projected, storedOverride, baseline } = params

  if (storedOverride !== undefined && proficiencyGrantSetsEqual(projected, storedOverride)) {
    return undefined
  }

  if (hasNonEmptyGrantSet(projected)) {
    return projected
  }

  if (mode === 'none') {
    return resolveEmptyArmorNoneModePatch(projected, storedOverride, baseline)
  }

  return resolveEmptyArmorCategoriesOrSpecificPatch(projected, storedOverride, baseline)
}
