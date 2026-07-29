import type { CharacterClass, ClassStored } from '@rpg/contracts'
import {
  classDraftStoredSchema,
  classStoredBodySchema,
  classStoredSchema,
  createClassDraftInputSchema,
  createClassInputSchema,
  updateClassDraftInputSchema,
  updateClassInputSchema,
} from '@rpg/contracts'

import type { ZodType } from 'zod'

import type { ContentTypeConfig } from '../lib/content-type-config'
import type { ContentWriteConfig, HomebrewDoc } from '../lib/content-write-config'
import type { OverlayPatch } from '../lib/resolve-catalog'
import { homebrewContentEnvelope } from '../lib/homebrew-envelope'
import { parseClassReadModel } from './derive-classes-catalog'
import { ClassPatchModel } from './class-patch.model'
import { HomebrewClassModel, type HomebrewClassSchemaType } from './homebrew-class.model'
import { loadSeedClassesStored, seedClassSlugs } from '@rpg/catalog/classes'

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
    ...homebrewContentEnvelope(doc),
    name: doc.name,
    ...(doc.imageKey !== undefined && { imageKey: doc.imageKey }),
    ...(doc.description !== undefined && { description: doc.description }),
    ...(doc.primaryAbilities != null && { primaryAbilities: doc.primaryAbilities }),
    ...(doc.hitDie != null && { hitDie: doc.hitDie }),
    ...(doc.spellcasting != null && { spellcasting: doc.spellcasting }),
    ...(doc.proficiencies != null && {
      proficiencies: doc.proficiencies as CharacterClass['proficiencies'],
    }),
    ...(doc.characterCreation != null && { characterCreation: doc.characterCreation }),
    features: doc.features ?? [],
  } as CharacterClass
}

function bodyFromCreateInput(input: Record<string, unknown>): Record<string, unknown> {
  const { slug: _slug, ...body } = input
  return body
}

function prepareHomebrewUpdate(
  _doc: HomebrewDoc,
  update: Record<string, unknown>,
): Record<string, unknown> {
  return update
}

export const classContentConfig: ContentTypeConfig<CharacterClass> = {
  type: 'classes',
  system: {
    load: (rulesetId) => loadSeedClassesStored(rulesetId) as CharacterClass[],
    slugs: seedClassSlugs,
    loadPatches: async (campaignId) => {
      const docs = await ClassPatchModel.find({ campaignId }).lean<ClassPatchRecord[]>()
      return docs.map<OverlayPatch>((d) => ({ targetId: d.targetId, patch: d.patch }))
    },
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
  createDraftInputSchema: createClassDraftInputSchema,
  updateDraftInputSchema: updateClassDraftInputSchema,
  storedSchema: classStoredSchema as unknown as ZodType<CharacterClass>,
  draftStoredSchema: classDraftStoredSchema,
  bodySchema: classStoredBodySchema,
  homebrewModel: HomebrewClassModel,
  patchModel: ClassPatchModel,
  toHomebrewEntity: toHomebrewClass,
  bodyFromCreateInput,
  prepareHomebrewUpdate,
  afterWrite: async (ctx) => parseClassReadModel(ctx.entity as ClassStored),
}

export const classRegistration = {
  read: classContentConfig,
  write: classWriteConfig,
} as const
