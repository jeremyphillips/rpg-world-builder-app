import type { XpThresholdOverrideEntry, XpThresholdsPatch } from '@rpg/contracts'

import {
  buildXpThresholdsPatchInput,
  resolveSystemXpEntries,
  type XpThresholdOverrideFormEntry,
} from './xp-thresholds-field.lib'

const DEFAULT_RULESET_ID = 'srd-cc-5.2.1' as const

export function mapXpThresholdOverridesToFormValues(
  patch: XpThresholdsPatch | undefined,
): XpThresholdOverrideFormEntry[] {
  return patch?.entries ?? []
}

export function buildXpThresholdsProgressionPatchInput(
  overrides: readonly XpThresholdOverrideEntry[],
): XpThresholdsPatch | undefined {
  return buildXpThresholdsPatchInput(overrides, resolveSystemXpEntries(DEFAULT_RULESET_ID))
}
