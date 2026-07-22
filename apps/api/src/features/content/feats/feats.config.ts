import type { Feat } from '@rpg/contracts'
import {
  createFeatInputSchema,
  featBodySchema,
  featSchema,
  updateFeatInputSchema,
} from '@rpg/contracts'

import type { ContentTypeConfig } from '../lib/content-type-config'
import type { ContentWriteConfig, HomebrewDoc } from '../lib/content-write-config'
import type { OverlayPatch } from '../lib/resolve-catalog'
import { homebrewContentEnvelope } from '../lib/homebrew-envelope'
import { loadSeedFeats, seedFeatSlugs } from '@rpg/catalog/feats'
import { HomebrewFeatModel, type HomebrewFeatSchemaType } from './homebrew-feat.model'
import { FeatPatchModel } from './feat-patch.model'

type HomebrewFeatRecord = HomebrewFeatSchemaType & { _id: unknown }

interface FeatPatchRecord {
  targetId: string
  patch: Record<string, unknown>
}

function toHomebrewFeat(doc: HomebrewDoc): Feat {
  const record = doc as HomebrewFeatRecord
  return {
    ...homebrewContentEnvelope(record),
    name: record.name,
    ...(record.imageKey !== undefined && { imageKey: record.imageKey }),
    ...(record.description !== undefined && { description: record.description }),
    category: record.category,
    ...(record.prerequisite !== undefined && {
      prerequisite: record.prerequisite as Feat['prerequisite'],
    }),
    repeatable: {
      allowed: record.repeatable.allowed,
      ...(record.repeatable.notes !== undefined && { notes: record.repeatable.notes }),
    },
    ...(record.benefit !== undefined && { benefit: record.benefit as Feat['benefit'] }),
  } as Feat
}

function bodyFromCreateInput(input: Record<string, unknown>): Record<string, unknown> {
  const { slug: _slug, ...body } = input
  return body
}

export const featContentConfig: ContentTypeConfig<Feat> = {
  type: 'feats',
  loadSystem: loadSeedFeats,
  systemSlugs: seedFeatSlugs,
  loadPatches: async (campaignId) => {
    const docs = await FeatPatchModel.find({ campaignId }).lean<FeatPatchRecord[]>()
    return docs.map<OverlayPatch>((d) => ({ targetId: d.targetId, patch: d.patch }))
  },
  loadHomebrew: async (campaignId, rulesetId) => {
    const docs = await HomebrewFeatModel.find({ campaignId, rulesetId }).lean<
      HomebrewFeatRecord[]
    >()
    return docs.map(toHomebrewFeat)
  },
}

export const featWriteConfig: ContentWriteConfig<Feat> = {
  typeName: 'feats',
  readConfig: featContentConfig,
  responseKey: 'feats',
  createInputSchema: createFeatInputSchema,
  updateInputSchema: updateFeatInputSchema,
  storedSchema: featSchema,
  bodySchema: featBodySchema,
  homebrewModel: HomebrewFeatModel,
  patchModel: FeatPatchModel,
  toHomebrewEntity: toHomebrewFeat,
  bodyFromCreateInput,
}

export const featRegistration = {
  read: featContentConfig,
  write: featWriteConfig,
} as const
