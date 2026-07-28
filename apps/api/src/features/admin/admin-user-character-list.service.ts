import {
  API_CONTENT_TYPE_KEYS,
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  type AdminUserCharacterListQuery,
  type CampaignContentEligibilityEntry,
  type AdminUserCharacterSummary,
  type SystemRulesetId,
} from '@rpg/contracts'
import { loadSeedSubclasses } from '@rpg/catalog/classes'

import { enrichPcsWithOpenCampaign, listCharactersForUser } from '../character'
import {
  buildCampaignContentEligibilityMap,
  formatInviteCharacterSummary,
} from '../campaign-invite'
import { listSystemContentForRuleset } from '../ruleset'
import type { ContentTypeName } from '../content'

type EligibilityContentRow = {
  id: string
  name?: string
  slug?: string
}

function rowLabel(row: EligibilityContentRow): string {
  return row.name ?? row.slug ?? row.id
}

function addContentRows(
  map: Map<string, CampaignContentEligibilityEntry>,
  rows: EligibilityContentRow[],
): void {
  for (const row of rows) {
    map.set(row.id, { access: DEFAULT_CONTENT_CAMPAIGN_ACCESS, label: rowLabel(row) })
  }
}

async function buildRulesetContentEligibilityMap(
  rulesetId: SystemRulesetId,
): Promise<Map<string, CampaignContentEligibilityEntry>> {
  const map = new Map<string, CampaignContentEligibilityEntry>()

  for (const contentType of API_CONTENT_TYPE_KEYS) {
    const items = listSystemContentForRuleset(contentType as ContentTypeName, rulesetId)
    addContentRows(map, items as EligibilityContentRow[])
  }

  const subclasses = loadSeedSubclasses(rulesetId)
  for (const subclass of subclasses) {
    map.set(subclass.id, {
      access: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
      label: subclass.name ?? subclass.slug ?? subclass.id,
    })
  }

  return map
}

async function resolveContentMapForCharacter(
  character: { campaign?: { id: string }; rulesetId: string },
  campaignContentCache: Map<string, Map<string, CampaignContentEligibilityEntry>>,
  rulesetContentCache: Map<SystemRulesetId, Map<string, CampaignContentEligibilityEntry>>,
): Promise<Map<string, CampaignContentEligibilityEntry>> {
  if (character.campaign) {
    const cached = campaignContentCache.get(character.campaign.id)
    if (cached) return cached

    const map = await buildCampaignContentEligibilityMap(character.campaign.id)
    campaignContentCache.set(character.campaign.id, map)
    return map
  }

  const cached = rulesetContentCache.get(character.rulesetId as SystemRulesetId)
  if (cached) return cached

  const map = await buildRulesetContentEligibilityMap(character.rulesetId as SystemRulesetId)
  rulesetContentCache.set(character.rulesetId as SystemRulesetId, map)
  return map
}

export async function listAdminUserCharacterCards(
  userId: string,
): Promise<AdminUserCharacterSummary[]> {
  const characters = await listCharactersForUser(userId)
  const enriched = await enrichPcsWithOpenCampaign(characters)

  const campaignContentCache = new Map<string, Map<string, CampaignContentEligibilityEntry>>()
  const rulesetContentCache = new Map<
    SystemRulesetId,
    Map<string, CampaignContentEligibilityEntry>
  >()

  const cards: AdminUserCharacterSummary[] = []

  for (const character of enriched) {
    const contentMap = await resolveContentMapForCharacter(
      character,
      campaignContentCache,
      rulesetContentCache,
    )

    cards.push({
      id: character.id,
      name: character.name,
      summary: formatInviteCharacterSummary(character, contentMap),
      ...(character.campaign ? { campaign: character.campaign } : {}),
    })
  }

  return cards
}

export async function listAdminUserCharacters(
  userId: string,
  query: AdminUserCharacterListQuery,
): Promise<AdminUserCharacterSummary[]> {
  const cards = await listAdminUserCharacterCards(userId)
  const trimmedSearch = query.q?.trim().toLowerCase()

  return cards.filter((card) => {
    if (trimmedSearch) {
      const haystack = `${card.name} ${card.summary}`.toLowerCase()
      if (!haystack.includes(trimmedSearch)) return false
    }

    if (query.campaign === 'in-campaign' && !card.campaign) return false
    if (query.campaign === 'no-campaign' && card.campaign) return false

    return true
  })
}
