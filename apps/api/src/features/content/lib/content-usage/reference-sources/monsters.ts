import type { ContentUsageBlocker } from '@rpg/contracts'
import { getContentTypeTerm } from '@rpg/contracts'

import { loadSeedMonsters } from '@rpg/catalog/monsters'

import { requireCampaignRuleset } from '../../../../vocabulary'
import { HomebrewMonsterModel } from '../../../monsters/homebrew-monster.model'
import type { ContentUsageResolverContext } from '../content-usage-context'
import { indexRecordsByContentId } from './index-by-content-id'

type LeanMonster = {
  id: string
  slug: string
  name: string
  rulesetId: string
  equipment?: Array<{ equipmentId: string }>
  proficiencies?: { skills?: Array<{ skill: string }> }
}

function extractEquipmentIds(monster: LeanMonster): readonly string[] {
  return (monster.equipment ?? []).map((entry) => entry.equipmentId)
}

function extractSkillIds(monster: LeanMonster): readonly string[] {
  return (monster.proficiencies?.skills ?? []).map((entry) => entry.skill)
}

function toMonsterBlocker(monster: LeanMonster): ContentUsageBlocker {
  return {
    kind: 'content',
    contentTypeKey: 'monsters',
    id: monster.id,
    slug: monster.slug,
    label: monster.name,
  }
}

async function loadCampaignMonsters(campaignId: string): Promise<LeanMonster[]> {
  const { rulesetId } = await requireCampaignRuleset(campaignId)
  const homebrew = await HomebrewMonsterModel.find({ campaignId }).lean<LeanMonster[]>()
  const system = loadSeedMonsters(rulesetId).map((monster) => ({
    id: monster.id,
    slug: monster.slug,
    name: monster.name,
    rulesetId: monster.rulesetId,
    equipment: monster.equipment,
    proficiencies: monster.proficiencies,
  }))
  return [
    ...system,
    ...homebrew.map((doc) => ({
      ...doc,
      id: String('id' in doc && doc.id != null ? doc.id : (doc as { _id?: unknown })._id),
    })),
  ]
}

export async function indexMonsterEquipmentBlockersByContentId(
  ctx: ContentUsageResolverContext,
): Promise<Map<string, ContentUsageBlocker[]>> {
  const monsters = await loadCampaignMonsters(ctx.campaignId)
  return indexRecordsByContentId(monsters, extractEquipmentIds, toMonsterBlocker)
}

export async function indexMonsterSkillProficiencyBlockersByContentId(
  ctx: ContentUsageResolverContext,
): Promise<Map<string, ContentUsageBlocker[]>> {
  const monsters = await loadCampaignMonsters(ctx.campaignId)
  return indexRecordsByContentId(monsters, extractSkillIds, toMonsterBlocker)
}

/** Resolves system seed monsters referencing equipment for delete guards in dev campaigns. */
export async function indexSystemMonsterEquipmentBlockers(
  rulesetId: string,
  equipmentId: string,
): Promise<ContentUsageBlocker[]> {
  const blockers: ContentUsageBlocker[] = []
  for (const monster of loadSeedMonsters(rulesetId as 'srd-cc-5.2.1')) {
    if (monster.equipment.some((entry) => entry.equipmentId === equipmentId)) {
      blockers.push({
        kind: 'content',
        contentTypeKey: 'monsters',
        id: monster.id,
        slug: monster.slug,
        label: monster.name,
      })
    }
  }
  return blockers
}

export function monsterUsageLabel(): string {
  return getContentTypeTerm('monsters').label
}
