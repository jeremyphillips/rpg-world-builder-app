import type { StartingWealth } from '@rpg/contracts'
import {
  createStartingWealthInputSchema,
  startingWealthBodySchema,
  startingWealthSchema,
  updateStartingWealthInputSchema,
} from '@rpg/contracts'

import type { ContentTypeConfig } from '../lib/content-type-config'
import type { ContentWriteConfig, HomebrewDoc } from '../lib/content-write-config'
import type { OverlayPatch } from '../lib/resolve-catalog'
import { loadSeedStartingWealth, seedStartingWealthSlugs } from '@rpg/catalog/starting-wealth'
import {
  HomebrewStartingWealthModel,
  type HomebrewStartingWealthSchemaType,
} from './homebrew-starting-wealth.model'
import { StartingWealthPatchModel } from './starting-wealth-patch.model'

type HomebrewStartingWealthRecord = HomebrewStartingWealthSchemaType & { _id: unknown }

interface StartingWealthPatchRecord {
  targetId: string
  patch: Record<string, unknown>
}

function toHomebrewStartingWealth(doc: HomebrewDoc): StartingWealth {
  const record = doc as HomebrewStartingWealthRecord
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
    scope: record.scope as StartingWealth['scope'],
    tiers: record.tiers as StartingWealth['tiers'],
  } as StartingWealth
}

function bodyFromCreateInput(input: Record<string, unknown>): Record<string, unknown> {
  const { slug: _slug, ...body } = input
  return body
}

export const startingWealthContentConfig: ContentTypeConfig<StartingWealth> = {
  type: 'starting-wealth',
  loadSystem: loadSeedStartingWealth,
  systemSlugs: seedStartingWealthSlugs,
  loadPatches: async (campaignId) => {
    const docs = await StartingWealthPatchModel.find({ campaignId }).lean<
      StartingWealthPatchRecord[]
    >()
    return docs.map<OverlayPatch>((d) => ({ targetId: d.targetId, patch: d.patch }))
  },
  loadHomebrew: async (campaignId, rulesetId) => {
    const docs = await HomebrewStartingWealthModel.find({ campaignId, rulesetId }).lean<
      HomebrewStartingWealthRecord[]
    >()
    return docs.map(toHomebrewStartingWealth)
  },
}

export const startingWealthWriteConfig: ContentWriteConfig<StartingWealth> = {
  typeName: 'starting-wealth',
  readConfig: startingWealthContentConfig,
  responseKey: 'startingWealth',
  createInputSchema: createStartingWealthInputSchema,
  updateInputSchema: updateStartingWealthInputSchema,
  storedSchema: startingWealthSchema,
  bodySchema: startingWealthBodySchema,
  homebrewModel: HomebrewStartingWealthModel,
  patchModel: StartingWealthPatchModel,
  toHomebrewEntity: toHomebrewStartingWealth,
  bodyFromCreateInput,
}

export const startingWealthRegistration = {
  read: startingWealthContentConfig,
  write: startingWealthWriteConfig,
} as const
