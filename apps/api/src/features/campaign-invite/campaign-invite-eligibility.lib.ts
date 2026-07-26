import type { Character } from '@rpg/contracts'
import {
  API_CONTENT_TYPE_KEYS,
  getCharacterTotalLevel,
  type ApiContentTypeKey,
  type CampaignContentEligibilityEntry,
} from '@rpg/contracts'

import { resolveContentForCampaign } from '../content/content-types'
import { attachCampaignAccessForTargetType } from '../content/lib/content-campaign-access.service'
import { resolveSubclassesForCampaign } from '../content/subclasses/list-subclasses'

type EligibilityContentRow = {
  id: string
  name?: string
  slug?: string
  campaignAccess: CampaignContentEligibilityEntry['access']
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

export async function buildCampaignContentEligibilityMap(
  campaignId: string,
): Promise<Map<string, CampaignContentEligibilityEntry>> {
  const map = new Map<string, CampaignContentEligibilityEntry>()

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
    addContentRows(map, entry.items)
  }

  const classes = catalogEntries.find((entry) => entry.contentType === 'classes')?.items ?? []
  const subclassGroups = await Promise.all(
    classes.map((characterClass) => resolveSubclassesForCampaign(campaignId, characterClass.id)),
  )

  for (const subclasses of subclassGroups) {
    addContentRows(map, subclasses as EligibilityContentRow[])
  }

  return map
}

export function formatInviteCharacterSummary(
  character: Pick<Character, 'classes' | 'species'>,
  campaignContentById: ReadonlyMap<string, CampaignContentEligibilityEntry>,
): string {
  const speciesEntry = campaignContentById.get(character.species.id)
  const speciesName = speciesEntry?.label ?? character.species.id

  const classSegments = character.classes.map((entry) => {
    const classEntry = campaignContentById.get(entry.classId)
    const className = classEntry?.label ?? entry.classId
    const subclassEntry = entry.subclassId ? campaignContentById.get(entry.subclassId) : undefined
    const subclassPart = subclassEntry ? ` (${subclassEntry.label})` : ''
    return `${className} ${entry.level}${subclassPart}`
  })

  const classPart = character.classes.length === 1 ? classSegments[0] : classSegments.join(' / ')

  return `${speciesName} · Level ${getCharacterTotalLevel(character)} ${classPart ?? ''}`.trim()
}
