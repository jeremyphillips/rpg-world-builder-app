import {
  CONTENT_CATALOG_PLAY_SCOPE,
  CONTENT_CATALOG_SCOPE_QUERY,
  serializePlayActorQuery,
  type ContentPlayActor,
} from '@rpg/contracts'
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

function buildPlayCatalogQuery(playActor: ContentPlayActor): string {
  const params = new URLSearchParams()
  params.set(CONTENT_CATALOG_SCOPE_QUERY, CONTENT_CATALOG_PLAY_SCOPE)
  for (const [key, value] of Object.entries(serializePlayActorQuery(playActor))) {
    params.set(key, value)
  }
  return `?${params.toString()}`
}

async function listCampaignContent<T>(
  campaignId: string,
  config: CampaignContentConfig,
  playActor: ContentPlayActor,
): Promise<T[]> {
  const body = await request<Record<string, T[]>>(
    `/api/campaigns/${campaignId}/content/${config.routeKey}${buildPlayCatalogQuery(playActor)}`,
    undefined,
    CAMPAIGN_CONTENT_ERROR,
  )
  return body[config.responseKey] as T[]
}

export type FetchCampaignBuilderCatalogOptions = {
  playActor: ContentPlayActor
}

/** Campaign-scoped catalog lists for the character builder (homebrew + system). */
export async function fetchCampaignBuilderCatalog(
  campaignId: string,
  rulesetId: SystemRulesetId,
  options: FetchCampaignBuilderCatalogOptions,
): Promise<BuilderCatalogLists> {
  const { playActor } = options

  const [species, classes, spells, equipment, skillProficiencies, organizations, languages] =
    await Promise.all([
      listCampaignContent<Species>(campaignId, CAMPAIGN_CATALOG_CONTENT[0], playActor),
      listCampaignContent<CharacterClass>(campaignId, CAMPAIGN_CATALOG_CONTENT[1], playActor),
      listCampaignContent<Spell>(campaignId, CAMPAIGN_CATALOG_CONTENT[2], playActor),
      listCampaignContent<Equipment>(campaignId, CAMPAIGN_CATALOG_CONTENT[3], playActor),
      listCampaignContent<SkillProficiency>(campaignId, CAMPAIGN_CATALOG_CONTENT[4], playActor),
      listCampaignContent<Organization>(campaignId, CAMPAIGN_CATALOG_CONTENT[5], playActor),
      listRulesetLanguages(rulesetId),
    ])

  return { species, classes, spells, equipment, skillProficiencies, organizations, languages }
}

export function campaignBuildContextQueryKey(campaignId: string, playActor: ContentPlayActor) {
  const actorKey = playActor.kind === 'pc' ? playActor.characterId : playActor.kind
  return ['campaigns', campaignId, 'character-builder-context', actorKey] as const
}

export type { BuilderCatalogLists, CharacterBuildLanguageOption }
