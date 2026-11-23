import {
  DEFAULT_SYSTEM_RULESET_ID,
  type XpThresholdOverrideEntry,
  type XpThresholdsPatch,
} from '@rpg/contracts'

import {
  buildXpThresholdsPatchInput,
  resolveSystemXpEntries,
  type XpThresholdOverrideFormEntry,
} from './xp-thresholds-field.lib'

export function mapXpThresholdOverridesToFormValues(
  patch: XpThresholdsPatch | undefined,
): XpThresholdOverrideFormEntry[] {
  return patch?.entries ?? []
}

export function buildXpThresholdsProgressionPatchInput(
  overrides: readonly XpThresholdOverrideEntry[],
): XpThresholdsPatch | undefined {
  return buildXpThresholdsPatchInput(overrides, resolveSystemXpEntries(DEFAULT_SYSTEM_RULESET_ID))
}
