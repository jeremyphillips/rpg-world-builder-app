import {
  CONTENT_CATALOG_PLAY_SCOPE,
  CONTENT_CATALOG_REFERENCE_SCOPE,
  CONTENT_CATALOG_SCOPE_QUERY,
  serializePlayActorQuery,
  type ContentPlayActor,
} from '@rpg/contracts'
import type {
  CharacterBuildLanguageOption,
  CharacterClass,
  Equipment,
  Feat,
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
  { routeKey: 'feats', responseKey: 'feats' },
] as const satisfies readonly CampaignContentConfig[]

function buildPlayCatalogQuery(playActor: ContentPlayActor): string {
  const params = new URLSearchParams()
  params.set(CONTENT_CATALOG_SCOPE_QUERY, CONTENT_CATALOG_PLAY_SCOPE)
  for (const [key, value] of Object.entries(serializePlayActorQuery(playActor))) {
    params.set(key, value)
  }
  return `?${params.toString()}`
}

function buildReferenceCatalogQuery(): string {
  const params = new URLSearchParams()
  params.set(CONTENT_CATALOG_SCOPE_QUERY, CONTENT_CATALOG_REFERENCE_SCOPE)
  return `?${params.toString()}`
}

export type FetchCampaignBuilderCatalogOptions =
  | { scope: 'play'; playActor: ContentPlayActor }
  | { scope: 'reference' }

function buildCatalogScopeQuery(options: FetchCampaignBuilderCatalogOptions): string {
  if (options.scope === 'reference') {
    return buildReferenceCatalogQuery()
  }
  return buildPlayCatalogQuery(options.playActor)
}

async function listCampaignContent<T>(
  campaignId: string,
  config: CampaignContentConfig,
  options: FetchCampaignBuilderCatalogOptions,
): Promise<T[]> {
  const body = await request<Record<string, T[]>>(
    `/api/campaigns/${campaignId}/content/${config.routeKey}${buildCatalogScopeQuery(options)}`,
    undefined,
    CAMPAIGN_CONTENT_ERROR,
  )
  return body[config.responseKey] as T[]
}

/** Campaign-scoped catalog lists for the character builder (homebrew + system). */
export async function fetchCampaignBuilderCatalog(
  campaignId: string,
  rulesetId: SystemRulesetId,
  options: FetchCampaignBuilderCatalogOptions,
): Promise<BuilderCatalogLists> {
  const [species, classes, spells, equipment, skillProficiencies, organizations, feats, languages] =
    await Promise.all([
      listCampaignContent<Species>(campaignId, CAMPAIGN_CATALOG_CONTENT[0], options),
      listCampaignContent<CharacterClass>(campaignId, CAMPAIGN_CATALOG_CONTENT[1], options),
      listCampaignContent<Spell>(campaignId, CAMPAIGN_CATALOG_CONTENT[2], options),
      listCampaignContent<Equipment>(campaignId, CAMPAIGN_CATALOG_CONTENT[3], options),
      listCampaignContent<SkillProficiency>(campaignId, CAMPAIGN_CATALOG_CONTENT[4], options),
      listCampaignContent<Organization>(campaignId, CAMPAIGN_CATALOG_CONTENT[5], options),
      listCampaignContent<Feat>(campaignId, CAMPAIGN_CATALOG_CONTENT[6], options),
      listRulesetLanguages(rulesetId),
    ])

  return {
    species,
    classes,
    spells,
    equipment,
    skillProficiencies,
    organizations,
    feats,
    languages,
  }
}

export function campaignBuildContextQueryKey(
  campaignId: string,
  options: FetchCampaignBuilderCatalogOptions,
) {
  if (options.scope === 'reference') {
    return ['campaigns', campaignId, 'character-builder-context', 'reference'] as const
  }

  const actorKey =
    options.playActor.kind === 'pc' ? options.playActor.characterId : options.playActor.kind
  return ['campaigns', campaignId, 'character-builder-context', 'play', actorKey] as const
}

export type { BuilderCatalogLists, CharacterBuildLanguageOption }
