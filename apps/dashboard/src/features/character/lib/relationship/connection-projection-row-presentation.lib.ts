import type { CharacterRelationshipProjectionRow } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import {
  UNAVAILABLE_LOCATION_LABEL,
  UNAVAILABLE_ORGANIZATION_LABEL,
} from '../display/character-display'

export type ConnectionProjectionRowPresentation = {
  heading: string
  description: string
  headingHref?: string
  canViewRecord: boolean
}

function resolveTargetHeading(row: CharacterRelationshipProjectionRow): string {
  const target = row.target
  if (!target) {
    if (row.kind === 'organizationMembership') return UNAVAILABLE_ORGANIZATION_LABEL
    if (
      row.kind === 'resides_at' ||
      row.kind === 'owns' ||
      row.kind === 'tenant' ||
      row.kind === 'operator' ||
      row.kind === 'works_at' ||
      row.kind === 'hometown' ||
      row.kind === 'birthplace'
    ) {
      return UNAVAILABLE_LOCATION_LABEL
    }
    return 'Missing character'
  }

  return target.name
}

export function resolveProjectionRowHref(
  row: CharacterRelationshipProjectionRow,
  campaignId: string,
): string | undefined {
  const target = row.target
  if (!target || row.referenceStatus !== 'resolved') return undefined

  switch (target.type) {
    case 'character':
      return target.characterType === 'npc'
        ? ROUTES.campaign.npcs.detail(campaignId, target.id)
        : ROUTES.campaign.characters.detail(campaignId, target.id)
    case 'organization':
      return ROUTES.content.organizations.detail(campaignId, target.id)
    case 'location':
      return ROUTES.content.locations.detail(campaignId, target.id)
    default:
      return undefined
  }
}

export function resolveProjectionRowMetadataSummary(
  row: CharacterRelationshipProjectionRow,
): string {
  const parts: string[] = [row.roleLabel]

  if (row.kind === 'organizationMembership') {
    const title = (row.details as { title?: string }).title
    if (title) parts.push(title)
  }

  if (row.kind === 'resides_at') {
    const details = row.details as { isPrimary?: boolean }
    if (details.isPrimary) parts.push('Primary')
  }

  return parts.join(' · ')
}

export function resolveProjectionRowPresentation(
  row: CharacterRelationshipProjectionRow,
  campaignId: string,
): ConnectionProjectionRowPresentation {
  const headingHref = resolveProjectionRowHref(row, campaignId)

  return {
    heading: resolveTargetHeading(row),
    description: resolveProjectionRowMetadataSummary(row),
    headingHref,
    canViewRecord: Boolean(headingHref),
  }
}
