import type {
  CharacterOrganizationConnection,
  Organization,
  OrganizationDomain,
  OrganizationMemberSummary,
  PaginatedItems,
} from '@rpg/contracts'
import { resolveOrganizationMembershipPriority, sortOrganizationMembers } from '@rpg/contracts'

import { buildCampaignContentEligibilityIndex } from '../../campaign-invite'
import { CharacterModel } from '../../character'
import { buildCharacterCardSummaryDto } from '../../character'
import { resolveCatalogForCampaign } from '../content.service'
import { resolveContentUsage } from '../lib/content-usage/content-usage-resolvers'
import { organizationWriteConfig } from './organizations.config'

type CharacterMemberHit = {
  _id: unknown
  name: string
  characterType: 'pc' | 'npc'
  classes: Array<{ classId: string; level: number; subclassId?: string }>
  species: { id: string }
  connections?: {
    organizations?: CharacterOrganizationConnection[]
  }
}

type MemberSortRow = {
  id: string
  name: string
  priority?: number
  characterType: 'pc' | 'npc'
  membership: CharacterOrganizationConnection | undefined
  hit: CharacterMemberHit
}

const CHARACTER_MEMBER_PROJECTION = {
  _id: 1,
  name: 1,
  characterType: 1,
  classes: 1,
  species: 1,
  connections: 1,
} as const

function membershipForOrganization(
  hit: CharacterMemberHit,
  organizationId: string,
): CharacterOrganizationConnection | undefined {
  return (hit.connections?.organizations ?? []).find(
    (membership) => membership.organizationId === organizationId,
  )
}

/**
 * Paginated organization Members roster — discovers members via content-usage
 * registration (authoritative_guard), then projects membership title/priority
 * from character-owned `connections.organizations` and sorts canonically.
 */
export async function resolveOrganizationMembers(input: {
  campaignId: string
  organizationId: string
  page: number
  pageSize: number
}): Promise<PaginatedItems<OrganizationMemberSummary> | null> {
  const { campaignId, organizationId, page, pageSize } = input

  const catalog = await resolveCatalogForCampaign(organizationWriteConfig.readConfig, campaignId)
  const organization = catalog.find((record) => record.id === organizationId) as
    | Organization
    | undefined
  if (!organization) {
    return null
  }

  const domain = organization.organizationDomain as OrganizationDomain | undefined

  const { blockers } = await resolveContentUsage(
    { campaignId, purpose: 'authoritative_guard' },
    'organizations',
    organizationId,
  )

  const characterBlockers = blockers.filter(
    (blocker): blocker is Extract<typeof blocker, { kind: 'usage' }> => blocker.kind === 'usage',
  )
  const characterIds = characterBlockers.map((blocker) => blocker.usage.id)

  if (characterIds.length === 0) {
    return { items: [], total: 0 }
  }

  const [hits, contentIndex] = await Promise.all([
    CharacterModel.find({ _id: { $in: characterIds } })
      .select(CHARACTER_MEMBER_PROJECTION)
      .lean<CharacterMemberHit[]>(),
    buildCampaignContentEligibilityIndex(campaignId),
  ])

  const hitById = new Map(hits.map((hit) => [String(hit._id), hit]))

  const sortRows: MemberSortRow[] = characterIds.flatMap((characterId) => {
    const hit = hitById.get(characterId)
    if (!hit) return []

    const membership = membershipForOrganization(hit, organizationId)
    const priority =
      domain === undefined
        ? membership?.priority
        : resolveOrganizationMembershipPriority({
            membership: membership ?? {},
            domain,
            form: organization.organizationForm,
            functions: organization.functions,
            practices: organization.practices,
          })

    return [
      {
        id: characterId,
        name: hit.name,
        ...(priority !== undefined ? { priority } : {}),
        characterType: hit.characterType,
        membership,
        hit,
      },
    ]
  })

  const sorted = sortOrganizationMembers(sortRows)
  const total = sorted.length
  const skip = (page - 1) * pageSize
  const pageRows = sorted.slice(skip, skip + pageSize)

  const items: OrganizationMemberSummary[] = pageRows.map((row) => ({
    characterType: row.characterType,
    character: buildCharacterCardSummaryDto({
      character: {
        id: row.id,
        name: row.hit.name,
        classes: row.hit.classes,
        species: row.hit.species,
      },
      contentIndex,
    }),
    membership: {
      ...(row.membership?.title !== undefined ? { title: row.membership.title } : {}),
      ...(row.priority !== undefined ? { priority: row.priority } : {}),
    },
  }))

  return { items, total }
}
