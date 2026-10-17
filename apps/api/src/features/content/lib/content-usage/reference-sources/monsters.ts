import type { ContentUsageBlocker, Monster, SystemRulesetId } from '@rpg/contracts'
import { getContentTypeTerm } from '@rpg/contracts'

import { loadSeedMonsters } from '@rpg/catalog/monsters'

import type { ContentUsageResolverContext } from '../content-usage-context'
import { indexRecordsByContentId } from './index-by-content-id'

type LeanMonster = Pick<
  Monster,
  'id' | 'slug' | 'name' | 'rulesetId' | 'equipment' | 'proficiencies'
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

async function loadCampaignMonsters(campaignId: string): Promise<LeanMonster[]> {
  const [{ resolveCatalogForCampaign }, { monstersContentConfig }] = await Promise.all([
    import('../../../content.service'),
    import('../../../monsters/monsters.config'),
  ])
  const monsters = await resolveCatalogForCampaign(monstersContentConfig, campaignId)
  return monsters.map((monster) => ({
    id: monster.id,
    slug: monster.slug,
    name: monster.name,
    rulesetId: monster.rulesetId,
    equipment: monster.equipment,
    proficiencies: monster.proficiencies,
  }))
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
