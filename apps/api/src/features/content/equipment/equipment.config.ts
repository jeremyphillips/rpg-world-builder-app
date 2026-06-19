import type { Equipment } from '@rpg/contracts'

import type { ContentTypeConfig } from '../lib/content-type-config'
import { loadSeedEquipment, seedEquipmentSlugs } from '@rpg/catalog/equipment'

export const equipmentContentConfig: ContentTypeConfig<Equipment> = {
  type: 'equipment',
  loadSystem: loadSeedEquipment,
  systemSlugs: seedEquipmentSlugs,
  // TODO: Add EquipmentPatchModel when system-patch overlays are needed.
  loadPatches: async (_campaignId) => [],
  // TODO: Add HomebrewEquipmentModel when homebrew equipment authoring is needed.
  loadHomebrew: async (_campaignId, _rulesetId) => [],
}
