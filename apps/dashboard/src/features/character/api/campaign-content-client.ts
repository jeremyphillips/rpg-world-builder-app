import { CONTENT_PLAY_ACTOR_CHARACTER_ID_QUERY } from '@rpg/contracts'
import type {
  CharacterBuildLanguageOption,
  CharacterClass,
  ContentPlayActor,
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
  playActorCharacterId?: string,
): Promise<T[]> {
  const query = playActorCharacterId
    ? `?${CONTENT_PLAY_ACTOR_CHARACTER_ID_QUERY}=${encodeURIComponent(playActorCharacterId)}`
    : ''
  const body = await request<Record<string, T[]>>(
    `/api/campaigns/${campaignId}/content/${config.routeKey}${query}`,
    undefined,
    CAMPAIGN_CONTENT_ERROR,
  )
  return body[config.responseKey] as T[]
}

export type FetchCampaignBuilderCatalogOptions = {
  playActor?: ContentPlayActor
}

/** Campaign-scoped catalog lists for the character builder (homebrew + system). */
export async function fetchCampaignBuilderCatalog(
  campaignId: string,
  rulesetId: SystemRulesetId,
  options?: FetchCampaignBuilderCatalogOptions,
): Promise<BuilderCatalogLists> {
  const playActorCharacterId =
    options?.playActor?.kind === 'pc' ? options.playActor.characterId : undefined

  const [species, classes, spells, equipment, skillProficiencies, organizations, languages] =
    await Promise.all([
      listCampaignContent<Species>(campaignId, CAMPAIGN_CATALOG_CONTENT[0], playActorCharacterId),
      listCampaignContent<CharacterClass>(
        campaignId,
        CAMPAIGN_CATALOG_CONTENT[1],
        playActorCharacterId,
      ),
      listCampaignContent<Spell>(campaignId, CAMPAIGN_CATALOG_CONTENT[2], playActorCharacterId),
      listCampaignContent<Equipment>(campaignId, CAMPAIGN_CATALOG_CONTENT[3], playActorCharacterId),
      listCampaignContent<SkillProficiency>(
        campaignId,
        CAMPAIGN_CATALOG_CONTENT[4],
        playActorCharacterId,
      ),
      listCampaignContent<Organization>(
        campaignId,
        CAMPAIGN_CATALOG_CONTENT[5],
        playActorCharacterId,
      ),
      listRulesetLanguages(rulesetId),
    ])

  return { species, classes, spells, equipment, skillProficiencies, organizations, languages }
}

export function campaignBuildContextQueryKey(campaignId: string, playActorCharacterId?: string) {
  return playActorCharacterId
    ? (['campaigns', campaignId, 'character-builder-context', playActorCharacterId] as const)
    : (['campaigns', campaignId, 'character-builder-context'] as const)
}

export type { BuilderCatalogLists, CharacterBuildLanguageOption }
