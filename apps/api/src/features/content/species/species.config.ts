import type { Species } from '@rpg/contracts'
import {
  createSpeciesInputSchema,
  speciesBodySchema,
  speciesSchema,
  updateSpeciesInputSchema,
} from '@rpg/contracts'

import type { ContentTypeConfig } from '../lib/content-type-config'
import type { ContentWriteConfig, HomebrewDoc } from '../lib/content-write-config'
import type { OverlayPatch } from '../lib/resolve-catalog'
import { loadSeedSpecies, seedSpeciesSlugs } from '@rpg/catalog/species'
import { speciesValidateBeforeWrite } from './species-write-hooks'
import { HomebrewSpeciesModel, type HomebrewSpeciesSchemaType } from './homebrew-species.model'
import { SpeciesPatchModel } from './species-patch.model'

type HomebrewSpeciesRecord = HomebrewSpeciesSchemaType & { _id: unknown }

interface SpeciesPatchRecord {
  targetId: string
  patch: Record<string, unknown>
}

function toHomebrewSpecies(doc: HomebrewDoc): Species {
  const record = doc as HomebrewSpeciesRecord
  return {
    id: String(record._id),
    slug: record.slug,
    rulesetId: record.rulesetId,
    source: 'homebrew',
    campaignId: record.campaignId,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    name: record.name,
    ...(record.imageKey !== undefined && { imageKey: record.imageKey }),
    ...(record.description !== undefined && { description: record.description }),
    creatureType: record.creatureType,
    sizes: record.sizes ?? [],
    movement: record.movement as Species['movement'],
    traits: (record.traits ?? []) as Species['traits'],
    ...(record.heritage != null && {
      heritage: record.heritage as Species['heritage'],
    }),
    ...(record.characterCreation != null && {
      characterCreation: record.characterCreation as Species['characterCreation'],
    }),
  } as Species
}

function bodyFromCreateInput(input: Record<string, unknown>): Record<string, unknown> {
  const { slug: _slug, ...body } = input
  return body
}

export const speciesContentConfig: ContentTypeConfig<Species> = {
  type: 'species',
  loadSystem: loadSeedSpecies,
  systemSlugs: seedSpeciesSlugs,
  loadPatches: async (campaignId) => {
    const docs = await SpeciesPatchModel.find({ campaignId }).lean<SpeciesPatchRecord[]>()
    return docs.map<OverlayPatch>((d) => ({ targetId: d.targetId, patch: d.patch }))
  },
  loadHomebrew: async (campaignId, rulesetId) => {
    const docs = await HomebrewSpeciesModel.find({ campaignId, rulesetId }).lean<
      HomebrewSpeciesRecord[]
    >()
    return docs.map(toHomebrewSpecies)
  },
}

export const speciesWriteConfig: ContentWriteConfig<Species> = {
  typeName: 'species',
  readConfig: speciesContentConfig,
  responseKey: 'species',
  createInputSchema: createSpeciesInputSchema,
  updateInputSchema: updateSpeciesInputSchema,
  storedSchema: speciesSchema,
  bodySchema: speciesBodySchema,
  homebrewModel: HomebrewSpeciesModel,
  patchModel: SpeciesPatchModel,
  toHomebrewEntity: toHomebrewSpecies,
  bodyFromCreateInput,
  validateBeforeWrite: speciesValidateBeforeWrite,
}

export const speciesRegistration = {
  read: speciesContentConfig,
  write: speciesWriteConfig,
} as const
