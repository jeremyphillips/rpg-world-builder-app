import type { Subclass } from '@rpg/contracts'
import {
  createSubclassInputSchema,
  subclassBodySchema,
  subclassSchema,
  updateSubclassInputSchema,
} from '@rpg/contracts'

import type { ContentTypeConfig } from '../lib/content-type-config'
import type {
  ContentWriteConfig,
  ContentWriteContext,
  HomebrewDoc,
} from '../lib/content-write-config'
import type { OverlayPatch } from '../lib/resolve-catalog'
import { homebrewContentEnvelope } from '../lib/homebrew-envelope'
import { loadSeedSubclasses, seedSubclassSlugs } from '@rpg/catalog/classes'
import {
  assertSubclassParentClassExists,
  assertSubclassRouteClassId,
} from './assert-subclass-parent-class'
import { HomebrewSubclassModel, type HomebrewSubclassSchemaType } from './homebrew-subclass.model'
import { resolveSubclassCharacterUsageBlockers } from './resolve-subclass-character-usage-blockers'
import { SubclassPatchModel } from './subclass-patch.model'

type HomebrewSubclassRecord = HomebrewSubclassSchemaType & { _id: unknown }

interface SubclassPatchRecord {
  targetId: string
  patch: Record<string, unknown>
}

function toHomebrewSubclass(doc: HomebrewDoc): Subclass {
  const record = doc as HomebrewSubclassRecord
  return {
    ...homebrewContentEnvelope(record),
    name: record.name,
    classId: record.classId,
    ...(record.imageKey !== undefined && { imageKey: record.imageKey }),
    ...(record.description !== undefined && { description: record.description }),
    ...(record.tagline !== undefined && { tagline: record.tagline }),
    features: (record.features ?? []) as Subclass['features'],
  } as Subclass
}

function bodyFromCreateInput(input: Record<string, unknown>): Record<string, unknown> {
  const { slug: _slug, ...body } = input
  return body
}

async function validateSubclassBeforeWrite(ctx: ContentWriteContext): Promise<void> {
  const classId =
    (typeof ctx.input.classId === 'string' && ctx.input.classId) ||
    (ctx.existing as { classId?: string } | undefined)?.classId

  if (typeof classId !== 'string' || !classId) {
    throw new Error('Subclass writes require a parent classId.')
  }

  await assertSubclassParentClassExists(ctx.campaignId, classId)
}

export const subclassContentConfig: ContentTypeConfig<Subclass> = {
  type: 'subclasses',
  system: {
    load: loadSeedSubclasses,
    slugs: seedSubclassSlugs,
    loadPatches: async (campaignId) => {
      const docs = await SubclassPatchModel.find({ campaignId }).lean<SubclassPatchRecord[]>()
      return docs.map<OverlayPatch>((d) => ({ targetId: d.targetId, patch: d.patch }))
    },
  },
  loadHomebrew: async (campaignId, rulesetId) => {
    const docs = await HomebrewSubclassModel.find({ campaignId, rulesetId }).lean<
      HomebrewSubclassRecord[]
    >()
    return docs.map(toHomebrewSubclass)
  },
}

export const subclassWriteConfig: ContentWriteConfig<Subclass> = {
  typeName: 'classes',
  campaignAccessTargetType: 'subclasses',
  readConfig: subclassContentConfig,
  responseKey: 'subclasses',
  createInputSchema: createSubclassInputSchema,
  updateInputSchema: updateSubclassInputSchema,
  storedSchema: subclassSchema,
  bodySchema: subclassBodySchema,
  homebrewModel: HomebrewSubclassModel,
  patchModel: SubclassPatchModel,
  toHomebrewEntity: toHomebrewSubclass,
  bodyFromCreateInput,
  validateBeforeWrite: validateSubclassBeforeWrite,
  resolveCharacterUsageBlockers: resolveSubclassCharacterUsageBlockers,
}

export { assertSubclassRouteClassId }
