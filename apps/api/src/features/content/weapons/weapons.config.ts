import type { Weapon } from '@rpg/contracts'

import type { ContentTypeConfig } from '../lib/content-type-config'
import { loadSeedWeapons, seedWeaponSlugs } from '@rpg/catalog/weapons'

export const weaponsContentConfig: ContentTypeConfig<Weapon> = {
  type: 'weapons',
  loadSystem: loadSeedWeapons,
  systemSlugs: seedWeaponSlugs,
  // TODO: Add WeaponPatchModel when system-patch overlays are needed.
  loadPatches: async (_campaignId) => [],
  // TODO: Add HomebrewWeaponModel when homebrew weapon authoring is needed.
  loadHomebrew: async (_campaignId, _rulesetId) => [],
}
