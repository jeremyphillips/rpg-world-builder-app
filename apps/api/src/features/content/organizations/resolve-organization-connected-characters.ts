import type { PaginatedItems, ReferencingCharacterSummary } from '@rpg/contracts'

import { buildCampaignContentEligibilityIndex } from '../../campaign-invite'
import { CharacterModel } from '../../character'
import { buildCharacterCardSummaryDto } from '../../character/lib/build-character-card-summary-dto.lib'
import { resolveCatalogForCampaign } from '../content.service'
import { resolveContentUsage } from '../lib/content-usage/content-usage-resolvers'
import { organizationWriteConfig } from './organizations.config'

type CharacterReferenceHit = {
  _id: unknown
  name: string
  characterType: 'pc' | 'npc'
  classes: Array<{ classId: string; level: number; subclassId?: string }>
  species: { id: string }
}

const CHARACTER_REFERENCE_PROJECTION = {
  _id: 1,
  name: 1,
  characterType: 1,
  classes: 1,
  species: 1,
} as const

function sortCharacterBlockersByName<T extends { usage: { id: string; label: string } }>(
  blockers: readonly T[],
): T[] {
  return [...blockers].sort((left, right) => {
    const nameCompare = left.usage.label.localeCompare(right.usage.label, 'en', {
      sensitivity: 'base',
    })
    if (nameCompare !== 0) {
      return nameCompare
    }
    return left.usage.id.localeCompare(right.usage.id)
  })
}

async function loadReferencingCharacterSummaries(
  campaignId: string,
  characterIds: readonly string[],
): Promise<ReferencingCharacterSummary[]> {
  if (characterIds.length === 0) {
    return []
  }

  const [hits, contentIndex] = await Promise.all([
    CharacterModel.find({ _id: { $in: characterIds } })
      .select(CHARACTER_REFERENCE_PROJECTION)
      .lean<CharacterReferenceHit[]>(),
    buildCampaignContentEligibilityIndex(campaignId),
  ])

  const hitById = new Map(hits.map((hit) => [String(hit._id), hit]))

  return characterIds.flatMap((characterId) => {
    const hit = hitById.get(characterId)
    if (!hit) {
      return []
    }

    return [
      {
        characterType: hit.characterType,
        character: buildCharacterCardSummaryDto({
          character: {
            id: String(hit._id),
            name: hit.name,
            classes: hit.classes,
            species: hit.species,
          },
          contentIndex,
        }),
      },
    ]
  })
}

/**
 * Paginated connected-character cards — adapter over content-usage registration
 * discovery (authoritative_guard / open participations), not a parallel matcher path.
 */
export async function resolveOrganizationConnectedCharacters(input: {
  campaignId: string
  organizationId: string
  page: number
  pageSize: number
}): Promise<PaginatedItems<ReferencingCharacterSummary> | null> {
  const { campaignId, organizationId, page, pageSize } = input

  const catalog = await resolveCatalogForCampaign(organizationWriteConfig.readConfig, campaignId)
  const organization = catalog.find((record) => record.id === organizationId)
  if (!organization) {
    return null
  }

  const { blockers } = await resolveContentUsage(
    { campaignId, purpose: 'authoritative_guard' },
    'organizations',
    organizationId,
  )

  const characterBlockers = blockers.filter(
    (blocker): blocker is Extract<typeof blocker, { kind: 'usage' }> => blocker.kind === 'usage',
  )
  const sorted = sortCharacterBlockersByName(characterBlockers)
  const total = sorted.length
  const skip = (page - 1) * pageSize
  const pageBlockers = sorted.slice(skip, skip + pageSize)
  const items = await loadReferencingCharacterSummaries(
    campaignId,
    pageBlockers.map((blocker) => blocker.usage.id),
  )

  return { items, total }
}
