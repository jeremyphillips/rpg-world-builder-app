import type { CharacterClass, SystemRulesetId } from '@rpg/contracts'

import type { ContentTypeConfig } from '../lib/content-type-config'
import type { OverlayPatch } from '../lib/resolve-catalog'
import { ClassPatchModel } from './class-patch.model'
import { HomebrewClassModel } from './homebrew-class.model'
import { loadSeedClasses, seedClassSlugs } from './seed'

interface HomebrewClassRecord {
  _id: unknown
  slug: string
  rulesetId: SystemRulesetId
  campaignId: string
  name: string
  description?: string
  primaryAbilities: CharacterClass['primaryAbilities']
  hitDie: CharacterClass['hitDie']
  asiLevels: CharacterClass['asiLevels']
  subclassLevels: CharacterClass['subclassLevels']
  spellcasting?: CharacterClass['spellcasting']
  proficiencies: CharacterClass['proficiencies']
  features: CharacterClass['features']
  createdAt: Date
  updatedAt: Date
}

interface ClassPatchRecord {
  targetId: string
  patch: Record<string, unknown>
}

function toHomebrewClass(doc: HomebrewClassRecord): CharacterClass {
  return {
    id: String(doc._id),
    slug: doc.slug,
    rulesetId: doc.rulesetId,
    source: 'homebrew',
    campaignId: doc.campaignId,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    name: doc.name,
    ...(doc.description !== undefined && { description: doc.description }),
    primaryAbilities: doc.primaryAbilities,
    hitDie: doc.hitDie,
    asiLevels: doc.asiLevels,
    subclassLevels: doc.subclassLevels,
    ...(doc.spellcasting != null && { spellcasting: doc.spellcasting }),
    proficiencies: doc.proficiencies,
    features: doc.features ?? [],
  }
}

export const classContentConfig: ContentTypeConfig<CharacterClass> = {
  type: 'classes',
  loadSystem: loadSeedClasses,
  systemSlugs: seedClassSlugs,
  loadPatches: async (campaignId) => {
    const docs = await ClassPatchModel.find({ campaignId }).lean<ClassPatchRecord[]>()
    return docs.map<OverlayPatch>((d) => ({ targetId: d.targetId, patch: d.patch }))
  },
  loadHomebrew: async (campaignId, rulesetId) => {
    const docs = await HomebrewClassModel.find({ campaignId, rulesetId }).lean<
      HomebrewClassRecord[]
    >()
    return docs.map(toHomebrewClass)
  },
}
