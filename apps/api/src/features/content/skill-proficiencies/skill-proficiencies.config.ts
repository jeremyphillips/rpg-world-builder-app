import type { SkillProficiency } from '@rpg/contracts'
import {
  createSkillProficiencyInputSchema,
  skillProficiencyBodySchema,
  skillProficiencySchema,
  updateSkillProficiencyInputSchema,
} from '@rpg/contracts'

import type { ContentTypeConfig } from '../lib/content-type-config'
import type { ContentWriteConfig, HomebrewDoc } from '../lib/content-write-config'
import type { OverlayPatch } from '../lib/resolve-catalog'
import {
  loadSeedSkillProficiencies,
  seedSkillProficiencySlugs,
} from '@rpg/catalog/skill-proficiencies'
import {
  HomebrewSkillProficiencyModel,
  type HomebrewSkillProficiencySchemaType,
} from './homebrew-skill-proficiency.model'
import { SkillProficiencyPatchModel } from './skill-proficiency-patch.model'

type HomebrewSkillProficiencyRecord = HomebrewSkillProficiencySchemaType & { _id: unknown }

interface SkillProficiencyPatchRecord {
  targetId: string
  patch: Record<string, unknown>
}

function toHomebrewSkillProficiency(doc: HomebrewDoc): SkillProficiency {
  const record = doc as HomebrewSkillProficiencyRecord
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
    ability: record.ability,
  } as SkillProficiency
}

function bodyFromCreateInput(input: Record<string, unknown>): Record<string, unknown> {
  const { slug: _slug, ...body } = input
  return body
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
  loadHomebrew: async (campaignId, rulesetId) => {
    const docs = await HomebrewSkillProficiencyModel.find({ campaignId, rulesetId }).lean<
      HomebrewSkillProficiencyRecord[]
    >()
    return docs.map(toHomebrewSkillProficiency)
  },
}

export const skillProficiencyWriteConfig: ContentWriteConfig<SkillProficiency> = {
  typeName: 'skill-proficiencies',
  readConfig: skillProficiencyContentConfig,
  responseKey: 'skillProficiencies',
  createInputSchema: createSkillProficiencyInputSchema,
  updateInputSchema: updateSkillProficiencyInputSchema,
  storedSchema: skillProficiencySchema,
  bodySchema: skillProficiencyBodySchema,
  homebrewModel: HomebrewSkillProficiencyModel,
  patchModel: SkillProficiencyPatchModel,
  toHomebrewEntity: toHomebrewSkillProficiency,
  bodyFromCreateInput,
}

export const skillProficiencyRegistration = {
  read: skillProficiencyContentConfig,
  write: skillProficiencyWriteConfig,
} as const
