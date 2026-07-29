import type { Species } from '@rpg/contracts'
import {
  API_CONTENT_TYPE_KEYS,
  createCampaignContentEligibilityIndex,
  type ApiContentTypeKey,
  type CampaignContentEligibilityEntry,
  type CampaignContentEligibilityIndex,
  type CampaignHeritageEligibilityEntry,
  type CampaignLanguageEligibilityEntry,
} from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { findCampaignById } from '../campaign'
import {
  attachCampaignAccessForTargetType,
  resolveContentForCampaign,
  resolveSubclassesForCampaign,
} from '../content'
import { listRulesetLanguageOptions } from '../ruleset'

type EligibilityContentRow = {
  id: string
  name?: string
  slug?: string
  campaignAccess: CampaignContentEligibilityEntry['access']
  heritage?: Species['heritage']
}

function rowLabel(row: EligibilityContentRow): string {
  return row.name ?? row.slug ?? row.id
}

function addContentRows(
  map: Map<string, CampaignContentEligibilityEntry>,
  rows: EligibilityContentRow[],
): void {
  for (const row of rows) {
    map.set(row.id, { access: row.campaignAccess, label: rowLabel(row) })
  }
}

function addSlugRows(
  map: Map<string, CampaignContentEligibilityEntry>,
  rows: EligibilityContentRow[],
): void {
  for (const row of rows) {
    if (!row.slug) continue
    map.set(row.slug, { access: row.campaignAccess, label: rowLabel(row) })
  }
}

function addHeritageRows(
  map: Map<string, Map<string, CampaignHeritageEligibilityEntry>>,
  rows: EligibilityContentRow[],
): void {
  for (const row of rows) {
    if (!row.heritage?.options?.length) continue

    const heritageBySlug = new Map<string, CampaignHeritageEligibilityEntry>()
    for (const option of row.heritage.options) {
      const label = 'name' in option && typeof option.name === 'string' ? option.name : option.id
      heritageBySlug.set(option.id, {
        speciesId: row.id,
        label,
      })
    }
    map.set(row.id, heritageBySlug)
  }
}

export async function buildCampaignContentEligibilityIndex(
  campaignId: string,
): Promise<CampaignContentEligibilityIndex> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  const contentById = new Map<string, CampaignContentEligibilityEntry>()
  const skillsBySlug = new Map<string, CampaignContentEligibilityEntry>()
  const equipmentBySlug = new Map<string, CampaignContentEligibilityEntry>()
  const heritageBySpeciesId = new Map<string, Map<string, CampaignHeritageEligibilityEntry>>()

  const catalogEntries = await Promise.all(
    API_CONTENT_TYPE_KEYS.map(async (contentType) => {
      const items = await resolveContentForCampaign(contentType, campaignId)
      const withAccess = await attachCampaignAccessForTargetType(
        campaignId,
        contentType as ApiContentTypeKey,
        items,
      )
      return { contentType, items: withAccess as EligibilityContentRow[] }
    }),
  )

  for (const entry of catalogEntries) {
    addContentRows(contentById, entry.items)

    if (entry.contentType === 'skill-proficiencies') {
      addSlugRows(skillsBySlug, entry.items)
    }

    if (entry.contentType === 'equipment') {
      addSlugRows(equipmentBySlug, entry.items)
    }

    if (entry.contentType === 'species') {
      addHeritageRows(heritageBySpeciesId, entry.items)
    }
  }

  const classes = catalogEntries.find((entry) => entry.contentType === 'classes')?.items ?? []
  const subclassGroups = await Promise.all(
    classes.map((characterClass) => resolveSubclassesForCampaign(campaignId, characterClass.id)),
  )

  for (const subclasses of subclassGroups) {
    addContentRows(contentById, subclasses as EligibilityContentRow[])
  }

  const languagesBySlug = new Map<string, CampaignLanguageEligibilityEntry>(
    listRulesetLanguageOptions(campaign.rulesetId).map((language) => [
      language.id,
      { label: language.label },
    ]),
  )

  return createCampaignContentEligibilityIndex(contentById, {
    skillsBySlug,
    equipmentBySlug,
    languagesBySlug,
    heritageBySpeciesId,
  })
}

export async function buildCampaignContentEligibilityMap(
  campaignId: string,
): Promise<Map<string, CampaignContentEligibilityEntry>> {
  const index = await buildCampaignContentEligibilityIndex(campaignId)
  return new Map(index.contentById)
}
