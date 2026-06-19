import type { SkillProficiency } from '@rpg/contracts'

import type { ContentTypeConfig } from '../lib/content-type-config'
import type { OverlayPatch } from '../lib/resolve-catalog'
import {
  loadSeedSkillProficiencies,
  seedSkillProficiencySlugs,
} from '@rpg/catalog/skill-proficiencies'
import { SkillProficiencyPatchModel } from './skill-proficiency-patch.model'

interface SkillProficiencyPatchRecord {
  targetId: string
  patch: Record<string, unknown>
}

export const skillProficiencyContentConfig: ContentTypeConfig<SkillProficiency> = {
  type: 'skill-proficiencies',
  loadSystem: loadSeedSkillProficiencies,
  systemSlugs: seedSkillProficiencySlugs,
  loadPatches: async (campaignId) => {
    const docs = await SkillProficiencyPatchModel.find({ campaignId }).lean<
      SkillProficiencyPatchRecord[]
    >()
    return docs.map<OverlayPatch>((d) => ({ targetId: d.targetId, patch: d.patch }))
  },
  // TODO: Add HomebrewSkillProficiencyModel when homebrew skill proficiencies are needed.
  loadHomebrew: async (_campaignId, _rulesetId) => [],
}
