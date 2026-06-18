import type { Armor } from '@rpg/contracts'

import type { ContentTypeConfig } from '../lib/content-type-config'
import { loadSeedArmor, seedArmorSlugs } from './seed'

export const armorContentConfig: ContentTypeConfig<Armor> = {
  type: 'armor',
  loadSystem: loadSeedArmor,
  systemSlugs: seedArmorSlugs,
  // TODO: Add ArmorPatchModel when system-patch overlays are needed.
  loadPatches: async (_campaignId) => [],
  // TODO: Add HomebrewArmorModel when homebrew armor authoring is needed.
  loadHomebrew: async (_campaignId, _rulesetId) => [],
}
