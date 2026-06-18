import type { Species } from '@rpg/contracts'

import type { ContentTypeConfig } from '../lib/content-type-config'
import type { OverlayPatch } from '../lib/resolve-catalog'
import { SpeciesPatchModel } from './species-patch.model'
import { loadSeedSpecies, seedSpeciesSlugs } from './seed'

interface SpeciesPatchRecord {
  targetId: string
  patch: Record<string, unknown>
}

export const speciesContentConfig: ContentTypeConfig<Species> = {
  type: 'species',
  loadSystem: loadSeedSpecies,
  systemSlugs: seedSpeciesSlugs,
  loadPatches: async (campaignId) => {
    const docs = await SpeciesPatchModel.find({ campaignId }).lean<SpeciesPatchRecord[]>()
    return docs.map<OverlayPatch>((d) => ({ targetId: d.targetId, patch: d.patch }))
  },
  // TODO: Add HomebrewSpeciesModel when homebrew species authoring is needed.
  loadHomebrew: async (_campaignId, _rulesetId) => [],
}
