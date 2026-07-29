import type {
  CharacterBuildLanguageOption,
  CharacterClass,
  Equipment,
  Organization,
  SkillProficiency,
  Species,
  Spell,
  SystemRulesetId,
} from '@rpg/contracts'

import { request } from '@/lib/api-client'

import type { BuilderCatalogLists } from './ruleset-content-client'
import { listRulesetLanguages } from './ruleset-content-client'

const CAMPAIGN_CONTENT_ERROR = 'Could not load campaign content.'

type CampaignContentConfig = {
  routeKey: string
  responseKey: string
}

const CAMPAIGN_CATALOG_CONTENT = [
  { routeKey: 'species', responseKey: 'species' },
  { routeKey: 'classes', responseKey: 'classes' },
  { routeKey: 'spells', responseKey: 'spells' },
  { routeKey: 'equipment', responseKey: 'equipment' },
  { routeKey: 'skill-proficiencies', responseKey: 'skillProficiencies' },
  { routeKey: 'organizations', responseKey: 'organizations' },
] as const satisfies readonly CampaignContentConfig[]

async function listCampaignContent<T>(
  campaignId: string,
  config: CampaignContentConfig,
): Promise<T[]> {
  const body = await request<Record<string, T[]>>(
    `/api/campaigns/${campaignId}/content/${config.routeKey}`,
    undefined,
    CAMPAIGN_CONTENT_ERROR,
  )
  return body[config.responseKey] as T[]
}

/** Campaign-scoped catalog lists for the character builder (homebrew + system). */
export async function fetchCampaignBuilderCatalog(
  campaignId: string,
  rulesetId: SystemRulesetId,
): Promise<BuilderCatalogLists> {
  const [species, classes, spells, equipment, skillProficiencies, organizations, languages] =
    await Promise.all([
      listCampaignContent<Species>(campaignId, CAMPAIGN_CATALOG_CONTENT[0]),
      listCampaignContent<CharacterClass>(campaignId, CAMPAIGN_CATALOG_CONTENT[1]),
      listCampaignContent<Spell>(campaignId, CAMPAIGN_CATALOG_CONTENT[2]),
      listCampaignContent<Equipment>(campaignId, CAMPAIGN_CATALOG_CONTENT[3]),
      listCampaignContent<SkillProficiency>(campaignId, CAMPAIGN_CATALOG_CONTENT[4]),
      listCampaignContent<Organization>(campaignId, CAMPAIGN_CATALOG_CONTENT[5]),
      listRulesetLanguages(rulesetId),
    ])

  return { species, classes, spells, equipment, skillProficiencies, organizations, languages }
}

export function campaignBuildContextQueryKey(campaignId: string) {
  return ['campaigns', campaignId, 'character-builder-context'] as const
}

export type { BuilderCatalogLists, CharacterBuildLanguageOption }
