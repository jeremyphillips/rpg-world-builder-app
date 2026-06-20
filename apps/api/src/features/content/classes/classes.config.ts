import type { CharacterClass } from '@rpg/contracts'
import {
  classBodySchema,
  classSchema,
  createClassInputSchema,
  updateClassInputSchema,
} from '@rpg/contracts'

import type { ContentTypeConfig } from '../lib/content-type-config'
import type { ContentWriteConfig, HomebrewDoc } from '../lib/content-write-config'
import type { OverlayPatch } from '../lib/resolve-catalog'
import { ClassPatchModel } from './class-patch.model'
import { HomebrewClassModel, type HomebrewClassSchemaType } from './homebrew-class.model'
import { loadSeedClasses, seedClassSlugs } from '@rpg/catalog/classes'

// InferSchemaType gives wider primitives (string, number, string[]) for
// enum-constrained fields; Mixed fields become any. The single `as CharacterClass`
// cast in toHomebrewClass is safe because Zod validates data at write time.
type HomebrewClassRecord = HomebrewClassSchemaType & { _id: unknown }

interface ClassPatchRecord {
  targetId: string
  patch: Record<string, unknown>
}

function toHomebrewClass(doc: HomebrewDoc | HomebrewClassRecord): CharacterClass {
  return {
    id: String(doc._id),
    slug: doc.slug,
    rulesetId: doc.rulesetId,
    source: 'homebrew',
    campaignId: doc.campaignId,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    name: doc.name,
    ...(doc.imageKey !== undefined && { imageKey: doc.imageKey }),
    ...(doc.description !== undefined && { description: doc.description }),
    primaryAbilities: doc.primaryAbilities,
    hitDie: doc.hitDie,
    asiLevels: doc.asiLevels,
    subclassLevels: doc.subclassLevels,
    ...(doc.spellcasting != null && { spellcasting: doc.spellcasting }),
    proficiencies: doc.proficiencies,
    features: doc.features ?? [],
  } as CharacterClass
}

function bodyFromCreateInput(input: Record<string, unknown>): Record<string, unknown> {
  const { slug: _slug, ...body } = input
  return body
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

export const classWriteConfig: ContentWriteConfig<CharacterClass> = {
  typeName: 'classes',
  readConfig: classContentConfig,
  responseKey: 'classes',
  createInputSchema: createClassInputSchema,
  updateInputSchema: updateClassInputSchema,
  storedSchema: classSchema,
  bodySchema: classBodySchema,
  homebrewModel: HomebrewClassModel,
  patchModel: ClassPatchModel,
  toHomebrewEntity: toHomebrewClass,
  bodyFromCreateInput,
}
