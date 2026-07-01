import { expect } from 'vitest'

import { getRulesetPatchRead } from '../../features/vocabulary/ruleset-patch/ruleset-patch.service'
import { CampaignRulesetPatchModel } from '../../features/vocabulary/lib/campaign-ruleset-patch.model'
import type { RulesetPatchRead } from '@rpg/contracts'

/** Loads resolved ruleset patch read model; fails the test when the campaign is missing. */
export async function readRulesetPatch(campaignId: string): Promise<RulesetPatchRead> {
  const patch = await getRulesetPatchRead(campaignId)
  expect(patch).not.toBeNull()
  return patch!
}

/** Returns the raw sparse Mongo document for field-level persist assertions. */
export async function storedRulesetPatchDoc(campaignId: string) {
  return CampaignRulesetPatchModel.findOne({ campaignId }).lean()
}

/** Asserts a sparse-stored subdocument was unset (reverted to catalog/default resolution). */
export function expectStoredSparseUnset(value: unknown): void {
  expect(value).toBeUndefined()
}
