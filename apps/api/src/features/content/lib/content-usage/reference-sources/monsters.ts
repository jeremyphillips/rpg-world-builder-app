import type { ContentUsageBlocker, Monster, SystemRulesetId } from '@rpg/contracts'
import { getContentTypeTerm } from '@rpg/contracts'

import { loadSeedMonsters } from '@rpg/catalog/monsters'

import type { ContentUsageResolverContext } from '../content-usage-context'
import { indexRecordsByContentId } from './index-by-content-id'
import { loadOverlayAwareCatalogRows } from './overlay-failure-seed-referrers'

type LeanMonster = Pick<
  Monster,
  'id' | 'slug' | 'name' | 'rulesetId' | 'equipment' | 'proficiencies' | 'classIds'
>

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

function toLeanMonster(monster: Monster): LeanMonster {
  return {
    id: monster.id,
    slug: monster.slug,
    name: monster.name,
    rulesetId: monster.rulesetId,
    equipment: monster.equipment,
    classIds: monster.classIds,
    proficiencies: monster.proficiencies,
  }
}

async function loadCampaignMonsters(campaignId: string): Promise<LeanMonster[]> {
  const { monstersRegistration } = await import('../../../monsters/monsters.config')
  const monsters = await loadOverlayAwareCatalogRows(monstersRegistration.read, campaignId)
  return monsters.map((monster) => toLeanMonster(monster as Monster))
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
  rulesetId: SystemRulesetId,
  equipmentId: string,
): Promise<ContentUsageBlocker[]> {
  const blockers: ContentUsageBlocker[] = []
  for (const monster of loadSeedMonsters(rulesetId)) {
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

export async function indexMonsterClassBlockersByContentId(
  ctx: ContentUsageResolverContext,
): Promise<Map<string, ContentUsageBlocker[]>> {
  const monsters = await loadCampaignMonsters(ctx.campaignId)
  return indexRecordsByContentId(monsters, (monster) => monster.classIds ?? [], toMonsterBlocker)
}
