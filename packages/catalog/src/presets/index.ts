import { campaignPresetCatalogSchema, type CampaignPresetCatalog } from '@rpg/contracts'

import { loadCampaignTemplates } from './campaign-templates'
import { loadWorldSeedPacks } from './world-seed-packs'

export { getCampaignTemplateById, loadCampaignTemplates } from './campaign-templates'
export { getWorldSeedPackById, loadWorldSeedPacks } from './world-seed-packs'

// Validate collection-level uniqueness and template-to-pack references at
// module load, matching the fail-fast behavior of the SRD catalog loaders.
const PRESET_CATALOG = campaignPresetCatalogSchema.parse({
  campaignTemplates: loadCampaignTemplates(),
  worldSeedPacks: loadWorldSeedPacks(),
})

export function loadCampaignPresetCatalog(): CampaignPresetCatalog {
  return PRESET_CATALOG
}
